import { useState } from 'react';
import { db } from '../lib/db';
import { Loader2 } from 'lucide-react';

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

interface ProjectSettingsProps {
  project: Project;
  onClose: () => void;
  onUpdate: () => void;
}

export function ProjectSettings({ project, onClose, onUpdate }: ProjectSettingsProps) {
  const [title, setTitle] = useState(project.title);
  const [resolution, setResolution] = useState(`${project.width}x${project.height}`);
  const [fps, setFps] = useState(project.fps);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const [width, height] = resolution.split('x').map(Number);
      await db.projects.update(project.id, {
        title,
        width,
        height,
        fps,
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Error updating project settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Project Settings</h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Resolution
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1920x1080">1920x1080 (Landscape)</option>
                <option value="1080x1920">1080x1920 (Portrait)</option>
                <option value="1080x1080">1080x1080 (Square)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Frame Rate
              </label>
              <select
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={24}>24 fps (Cinematic)</option>
                <option value={25}>25 fps (PAL)</option>
                <option value={30}>30 fps (Standard)</option>
                <option value={60}>60 fps (Smooth)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
