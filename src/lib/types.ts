export interface Database {
  public: {
    Tables: {
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>;
      };
      project_images: {
        Row: ProjectImage;
        Insert: Omit<ProjectImage, 'id' | 'created_at'>;
        Update: Partial<Omit<ProjectImage, 'id' | 'created_at'>>;
      };
      project_music: {
        Row: ProjectMusic;
        Insert: Omit<ProjectMusic, 'id' | 'created_at'>;
        Update: Partial<Omit<ProjectMusic, 'id' | 'created_at'>>;
      };
      project_voiceovers: {
        Row: ProjectVoiceover;
        Insert: Omit<ProjectVoiceover, 'id' | 'created_at'>;
        Update: Partial<Omit<ProjectVoiceover, 'id' | 'created_at'>>;
      };
    };
  };
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  resolution: string;
  fps: number;
  default_image_duration: number;
  transition_type: string;
  transition_duration: number;
  enable_ken_burns: boolean;
  default_image_effect: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  file_path: string;
  file_name: string;
  order_index: number;
  duration: number;
  crop_mode: string;
  effect: string;
  created_at: string;
}

export interface ProjectMusic {
  id: string;
  project_id: string;
  file_path: string;
  file_name: string;
  volume: number;
  loop_enabled: boolean;
  fade_in_duration: number;
  fade_out_duration: number;
  created_at: string;
}

export interface ProjectVoiceover {
  id: string;
  project_id: string;
  file_path: string;
  file_name: string;
  start_time: number;
  volume: number;
  created_at: string;
}

export type ResolutionOption = '1920x1080' | '1080x1920' | '1080x1080';
export type TransitionType = 'crossfade' | 'slide' | 'zoom-in' | 'zoom-out' | 'random';
export type CropMode = 'fit' | 'blur_background';
export type EffectType =
  | 'none'
  | 'zoom-in'
  | 'zoom-out'
  | 'pan-left'
  | 'pan-right'
  | 'pan-up'
  | 'pan-down'
  | 'zoom-pan-left'
  | 'zoom-pan-right'
  | 'rotate-zoom'
  | 'random';
