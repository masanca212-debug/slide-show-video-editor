/*
  # Add Image Effects Feature

  1. Changes
    - Add `effect` column to project_images table for keyframe animations
    - Add `default_image_effect` to projects table
  
  2. Available Effects
    - zoom-in: Zoom in from 100% to 120%
    - zoom-out: Zoom out from 120% to 100%
    - pan-left: Pan from right to left
    - pan-right: Pan from left to right
    - pan-up: Pan from bottom to top
    - pan-down: Pan from top to bottom
    - zoom-pan-left: Zoom in while panning left
    - zoom-pan-right: Zoom in while panning right
    - rotate-zoom: Slight rotation while zooming
    - none: No effect (static)
    - random: Random effect will be applied
*/

-- Add effect column to project_images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_images' AND column_name = 'effect'
  ) THEN
    ALTER TABLE project_images ADD COLUMN effect text DEFAULT 'zoom-in';
  END IF;
END $$;

-- Add default_image_effect to projects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'default_image_effect'
  ) THEN
    ALTER TABLE projects ADD COLUMN default_image_effect text DEFAULT 'random';
  END IF;
END $$;
