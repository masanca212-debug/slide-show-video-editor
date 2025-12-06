import { useState, useRef } from 'react';
import { db } from '../lib/db';
import { createObjectURL, loadAudioDuration } from '../lib/storage';
import { useAuth } from '../contexts/AuthContext';
import { Upload, X, Volume2, Repeat, Loader2 } from 'lucide-react';

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

interface MusicUploaderProps {
  projectId: string;
  music: ProjectMusic[];
  onUpdate: () => void;
}

export function MusicUploader({ projectId, music, onUpdate }: MusicUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const duration = await loadAudioDuration(arrayBuffer);

        await db.music.create(projectId, user.id, file, {
          start_time: 0,
          duration,
          volume: 0.3,
        });
      }

      onUpdate();
    } catch (error) {
      console.error('Error uploading music:', error);
      alert('Error uploading music. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteMusic = async (musicItem: ProjectMusic) => {
    try {
      await db.music.delete(musicItem.id);
      onUpdate();
    } catch (error) {
      console.error('Error deleting music:', error);
    }
  };

  const updateMusic = async (musicId: string, updates: Partial<ProjectMusic>) => {
    try {
      await db.music.update(musicId, updates);
      onUpdate();
    } catch (error) {
      console.error('Error updating music:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Background Music</h3>
          <p className="text-sm text-slate-400">Add background music to your video</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload Music</span>
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {music.length === 0 ? (
        <div className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center">
          <Upload className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">No music uploaded yet</p>
          <p className="text-sm text-slate-500">Click "Upload Music" to add background music</p>
        </div>
      ) : (
        <div className="space-y-4">
          {music.map((musicItem) => (
            <div
              key={musicItem.id}
              className="bg-slate-700 rounded-lg p-4 border border-slate-600"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-white font-medium mb-1">{musicItem.file_name}</h4>
                  <p className="text-sm text-slate-400">Background Music Track</p>
                </div>
                <button
                  onClick={() => deleteMusic(musicItem)}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                    <Volume2 className="w-4 h-4" />
                    Volume: {Math.round(musicItem.volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={musicItem.volume * 100}
                    onChange={(e) => updateMusic(musicItem.id, { volume: parseInt(e.target.value) / 100 })}
                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
