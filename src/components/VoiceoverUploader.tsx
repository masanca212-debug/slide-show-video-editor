import { useState, useRef } from 'react';
import { db } from '../lib/db';
import { loadAudioDuration } from '../lib/storage';
import { useAuth } from '../contexts/AuthContext';
import { Upload, X, Volume2, Clock, Loader2 } from 'lucide-react';

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

interface VoiceoverUploaderProps {
  projectId: string;
  voiceovers: ProjectVoiceover[];
  onUpdate: () => void;
}

export function VoiceoverUploader({ projectId, voiceovers, onUpdate }: VoiceoverUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState({ minutes: 0, seconds: 0 });
  const [volume, setVolume] = useState(100);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowUploadModal(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const duration = await loadAudioDuration(arrayBuffer);
      const totalSeconds = startTime.minutes * 60 + startTime.seconds;

      await db.voiceovers.create(projectId, user.id, selectedFile, {
        start_time: totalSeconds,
        duration,
        volume: volume / 100,
      });

      setShowUploadModal(false);
      setSelectedFile(null);
      setStartTime({ minutes: 0, seconds: 0 });
      setVolume(100);
      onUpdate();
    } catch (error) {
      console.error('Error uploading voiceover:', error);
      alert('Error uploading voiceover. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteVoiceover = async (voiceover: ProjectVoiceover) => {
    try {
      await db.voiceovers.delete(voiceover.id);
      onUpdate();
    } catch (error) {
      console.error('Error deleting voiceover:', error);
    }
  };

  const updateVoiceover = async (voiceoverId: string, updates: Partial<ProjectVoiceover>) => {
    try {
      await db.voiceovers.update(voiceoverId, updates);
      onUpdate();
    } catch (error) {
      console.error('Error updating voiceover:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Voice Over</h3>
          <p className="text-sm text-slate-400">Add narration to specific timestamps</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Voice Over</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {voiceovers.length === 0 ? (
        <div className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center">
          <Upload className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">No voice overs uploaded yet</p>
          <p className="text-sm text-slate-500">Click "Upload Voice Over" to add narration</p>
        </div>
      ) : (
        <div className="space-y-4">
          {voiceovers.map((voiceover) => (
            <div
              key={voiceover.id}
              className="bg-slate-700 rounded-lg p-4 border border-slate-600"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-white font-medium mb-1">{voiceover.file_name}</h4>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>Starts at {formatTime(voiceover.start_time)}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteVoiceover(voiceover)}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                    <Volume2 className="w-4 h-4" />
                    Volume: {Math.round(voiceover.volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={voiceover.volume * 100}
                    onChange={(e) => updateVoiceover(voiceover.id, { volume: parseInt(e.target.value) / 100 })}
                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Start Time (seconds)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={voiceover.start_time}
                    onChange={(e) => updateVoiceover(voiceover.id, { start_time: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">Configure Voice Over</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Audio File
                </label>
                <div className="px-4 py-3 bg-slate-700 rounded-lg text-white">
                  {selectedFile.name}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Start Time
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Minutes</label>
                    <input
                      type="number"
                      min="0"
                      value={startTime.minutes}
                      onChange={(e) => setStartTime({ ...startTime, minutes: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Seconds</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={startTime.seconds}
                      onChange={(e) => setStartTime({ ...startTime, seconds: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                  <Volume2 className="w-4 h-4" />
                  Volume: {volume}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={uploading}
                className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Add Voice Over</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
