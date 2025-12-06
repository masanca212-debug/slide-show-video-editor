import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const STORAGE_BUCKETS = {
  IMAGES: 'video-images',
  MUSIC: 'video-music',
  VOICEOVERS: 'video-voiceovers',
} as const;

export async function initializeStorage() {
  const buckets = [
    STORAGE_BUCKETS.IMAGES,
    STORAGE_BUCKETS.MUSIC,
    STORAGE_BUCKETS.VOICEOVERS,
  ];

  for (const bucketName of buckets) {
    const { data: existingBucket } = await supabase.storage.getBucket(bucketName);

    if (!existingBucket) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 104857600,
      });
    }
  }
}
