/*
  # Storage Policies Setup

  1. Storage Buckets
    - video-images: Store project images
    - video-music: Store background music files
    - video-voiceovers: Store voice over audio files

  2. Security
    - Enable RLS-like policies for storage buckets
    - Users can only access files from their own projects
*/

-- Storage policies for video-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('video-images', 'video-images', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload images to own projects"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'video-images' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM projects WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view images from own projects"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'video-images' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM projects WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete images from own projects"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'video-images' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM projects WHERE user_id = auth.uid()
  )
);

-- Storage policies for video-music bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('video-music', 'video-music', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload music to own projects"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'video-music' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM projects WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view music from own projects"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'video-music' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM projects WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete music from own projects"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'video-music' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM projects WHERE user_id = auth.uid()
  )
);

-- Storage policies for video-voiceovers bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('video-voiceovers', 'video-voiceovers', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload voiceovers to own projects"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'video-voiceovers' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM projects WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view voiceovers from own projects"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'video-voiceovers' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM projects WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete voiceovers from own projects"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'video-voiceovers' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM projects WHERE user_id = auth.uid()
  )
);
