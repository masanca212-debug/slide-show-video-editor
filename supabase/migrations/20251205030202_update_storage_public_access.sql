/*
  # Update Storage Buckets for Public Access

  1. Changes
    - Make storage buckets public for easier preview access
    - Update bucket configuration to allow public URLs
  
  2. Security
    - RLS policies still control who can upload/delete
    - Only authenticated users can upload to their own projects
    - Files are publicly readable for preview purposes
*/

-- Update buckets to be public
UPDATE storage.buckets
SET public = true
WHERE id IN ('video-images', 'video-music', 'video-voiceovers');
