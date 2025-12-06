import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Video, Clock, LogOut, Trash2, Edit3 } from 'lucide-react';

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

interface ProjectListProps {
  onSelectProject: (projectId: string) => void;
}

export function ProjectList({ onSelectProject }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;

    try {
      const data = await db.projects.getByUser(user.id);
      const sorted = data.sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      setProjects(sorted);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await db.projects.delete(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Auto Video Editor</h1>
              <p className="text-slate-400">Create stunning video compilations</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        <button
          onClick={() => setShowNewProject(true)}
          className="w-full mb-6 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
            <Video className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-slate-400">Create your first video project to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectProject(project.id)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    <span>{project.width}x{project.height} @ {project.fps}fps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showNewProject && (
          <NewProjectModal
            onClose={() => setShowNewProject(false)}
            onSuccess={(projectId) => {
              setShowNewProject(false);
              loadProjects();
              onSelectProject(projectId);
            }}
          />
        )}
      </div>
    </div>
  );
}

interface NewProjectModalProps {
  onClose: () => void;
  onSuccess: (projectId: string) => void;
}

function NewProjectModal({ onClose, onSuccess }: NewProjectModalProps) {
  const [title, setTitle] = useState('');
  const [resolution, setResolution] = useState('1920x1080');
  const [fps, setFps] = useState(30);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const [width, height] = resolution.split('x').map(Number);
      const project = await db.projects.create(user.id, {
        title,
        width,
        height,
        fps,
        duration: 0,
      });

      onSuccess(project.id);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6">Create New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Awesome Video"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Resolution
            </label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1920x1080">1920x1080 (YouTube Landscape)</option>
              <option value="1080x1920">1080x1920 (YouTube Shorts)</option>
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
            </select>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
