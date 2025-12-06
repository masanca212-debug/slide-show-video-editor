/*
  # Video Editor Schema

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text) - project name
      - `resolution` (text) - 1920x1080, 1080x1920, etc
      - `fps` (integer) - 24, 25, 30
      - `default_image_duration` (numeric) - default seconds per image
      - `transition_type` (text) - crossfade, slide, zoom, etc
      - `transition_duration` (numeric) - transition duration in seconds
      - `enable_ken_burns` (boolean) - enable pan & zoom effect
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `project_images`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `file_path` (text) - path in Supabase storage
      - `file_name` (text) - original filename
      - `order_index` (integer) - order in slideshow
      - `duration` (numeric) - duration for this specific image
      - `crop_mode` (text) - fit, blur_background
      - `created_at` (timestamptz)
    
    - `project_music`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `file_path` (text) - path in Supabase storage
      - `file_name` (text) - original filename
      - `volume` (integer) - 0-100
      - `loop_enabled` (boolean)
      - `fade_in_duration` (numeric) - seconds
      - `fade_out_duration` (numeric) - seconds
      - `created_at` (timestamptz)
    
    - `project_voiceovers`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `file_path` (text) - path in Supabase storage
      - `file_name` (text) - original filename
      - `start_time` (numeric) - start timestamp in seconds
      - `volume` (integer) - 0-100
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own projects
  
  3. Storage
    - Create storage buckets for video-images, video-music, video-voiceovers
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  resolution text DEFAULT '1920x1080',
  fps integer DEFAULT 30,
  default_image_duration numeric DEFAULT 5.0,
  transition_type text DEFAULT 'crossfade',
  transition_duration numeric DEFAULT 0.5,
  enable_ken_burns boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create project_images table
CREATE TABLE IF NOT EXISTS project_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_name text NOT NULL,
  order_index integer NOT NULL,
  duration numeric DEFAULT 5.0,
  crop_mode text DEFAULT 'fit',
  created_at timestamptz DEFAULT now()
);

-- Create project_music table
CREATE TABLE IF NOT EXISTS project_music (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_name text NOT NULL,
  volume integer DEFAULT 30,
  loop_enabled boolean DEFAULT true,
  fade_in_duration numeric DEFAULT 2.0,
  fade_out_duration numeric DEFAULT 2.0,
  created_at timestamptz DEFAULT now()
);

-- Create project_voiceovers table
CREATE TABLE IF NOT EXISTS project_voiceovers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_name text NOT NULL,
  start_time numeric NOT NULL,
  volume integer DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_music ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_voiceovers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for project_images
CREATE POLICY "Users can view images from own projects"
  ON project_images FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_images.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add images to own projects"
  ON project_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_images.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update images in own projects"
  ON project_images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_images.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_images.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete images from own projects"
  ON project_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_images.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for project_music
CREATE POLICY "Users can view music from own projects"
  ON project_music FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_music.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add music to own projects"
  ON project_music FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_music.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update music in own projects"
  ON project_music FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_music.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_music.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete music from own projects"
  ON project_music FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_music.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for project_voiceovers
CREATE POLICY "Users can view voiceovers from own projects"
  ON project_voiceovers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_voiceovers.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add voiceovers to own projects"
  ON project_voiceovers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_voiceovers.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update voiceovers in own projects"
  ON project_voiceovers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_voiceovers.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_voiceovers.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete voiceovers from own projects"
  ON project_voiceovers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_voiceovers.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create storage buckets (these will need to be created via Supabase client)
-- Storage policies will be set up in the application code