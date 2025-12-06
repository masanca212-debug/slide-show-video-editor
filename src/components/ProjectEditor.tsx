import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { ArrowLeft, Settings, Play, Download } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { MusicUploader } from './MusicUploader';
import { VoiceoverUploader } from './VoiceoverUploader';
import { Timeline } from './Timeline';
import { ProjectSettings } from './ProjectSettings';
import { VideoRenderer } from './VideoRenderer';

interface Project {
  id: string;
  user_id: string;
  title: string;
  width: number;
  height: number;
  fps: number;
  duration: number;
  created_at: string;
  updated_at: string;
}

interface ProjectImage {
  id: string;
  project_id: string;
  user_id: string;
  file_name: string;
  file_data: ArrayBuffer;
  file_type: string;
  file_size: number;
  start_time: number;
  duration: number;
  layer: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  scale: number;
  effects: string;
  created_at: string;
}

interface ProjectMusic {
  id: string;
  project_id: string;
  user_id: string;
  file_name: string;
  file_data: ArrayBuffer;
  file_type: string;
  file_size: number;
  start_time: number;
  duration: number;
  volume: number;
  created_at: string;
}

interface ProjectVoiceover {
  id: string;
  project_id: string;
  user_id: string;
  file_name: string;
  file_data: ArrayBuffer;
  file_type: string;
  file_size: number;
  start_time: number;
  duration: number;
  volume: number;
  created_at: string;
}

interface ProjectEditorProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectEditor({ projectId, onBack }: ProjectEditorProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [music, setMusic] = useState<ProjectMusic[]>([]);
  const [voiceovers, setVoiceovers] = useState<ProjectVoiceover[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showRenderer, setShowRenderer] = useState(false);
  const [activeTab, setActiveTab] = useState<'images' | 'music' | 'voiceover' | 'timeline'>('images');

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      const [projectData, imagesData, musicData, voiceoversData] = await Promise.all([
        db.projects.getById(projectId),
        db.images.getByProject(projectId),
        db.music.getByProject(projectId),
        db.voiceovers.getByProject(projectId),
      ]);

      if (!projectData) throw new Error('Project not found');
      setProject(projectData);
      setImages(imagesData.sort((a, b) => a.layer - b.layer));
      setMusic(musicData);
      setVoiceovers(voiceoversData.sort((a, b) => a.start_time - b.start_time));
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">{project.title}</h1>
                <p className="text-sm text-slate-400">
                  {project.width}x{project.height} @ {project.fps}fps
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <button
                onClick={() => setShowRenderer(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Video</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('images')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === 'images'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Images ({images.length})
          </button>
          <button
            onClick={() => setActiveTab('music')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === 'music'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Music ({music.length})
          </button>
          <button
            onClick={() => setActiveTab('voiceover')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === 'voiceover'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Voice Over ({voiceovers.length})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === 'timeline'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Timeline
          </button>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          {activeTab === 'images' && (
            <ImageUploader
              projectId={projectId}
              images={images}
              onUpdate={loadProjectData}
            />
          )}
          {activeTab === 'music' && (
            <MusicUploader
              projectId={projectId}
              music={music}
              onUpdate={loadProjectData}
            />
          )}
          {activeTab === 'voiceover' && (
            <VoiceoverUploader
              projectId={projectId}
              voiceovers={voiceovers}
              onUpdate={loadProjectData}
            />
          )}
          {activeTab === 'timeline' && (
            <Timeline
              project={project}
              images={images}
              music={music}
              voiceovers={voiceovers}
            />
          )}
        </div>
      </div>

      {showSettings && (
        <ProjectSettings
          project={project}
          onClose={() => setShowSettings(false)}
          onUpdate={() => {
            setShowSettings(false);
            loadProjectData();
          }}
        />
      )}

      {showRenderer && (
        <VideoRenderer
          project={project}
          images={images}
          music={music}
          voiceovers={voiceovers}
          onClose={() => setShowRenderer(false)}
        />
      )}
    </div>
  );
}
