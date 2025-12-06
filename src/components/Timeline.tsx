import { Project, ProjectImage, ProjectMusic, ProjectVoiceover } from '../lib/types';
import { Image, Music, Mic } from 'lucide-react';

interface TimelineProps {
  project: Project;
  images: ProjectImage[];
  music: ProjectMusic[];
  voiceovers: ProjectVoiceover[];
}

export function Timeline({ project, images, music, voiceovers }: TimelineProps) {
  const totalImageDuration = images.reduce((sum, img) => sum + img.duration, 0);
  const pixelsPerSecond = 40;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Timeline</h3>
          <p className="text-sm text-slate-400">
            Total Duration: {formatTime(totalImageDuration)}
          </p>
        </div>
        <div className="text-sm text-slate-400">
          Scale: {pixelsPerSecond}px/sec
        </div>
      </div>

      <div className="bg-slate-900 rounded-lg p-6 border border-slate-700 overflow-x-auto">
        <div className="mb-6 flex items-center gap-4 text-xs text-slate-400">
          {[0, 10, 20, 30, 40, 50, 60].map((sec) => (
            <div
              key={sec}
              className="text-center"
              style={{ width: `${pixelsPerSecond * 10}px` }}
            >
              {formatTime(sec)}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Image className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white">Image Slides</span>
            </div>
            <div className="flex gap-1 bg-slate-800 rounded p-2 min-h-[60px]">
              {images.map((image, index) => {
                const widthPx = image.duration * pixelsPerSecond;
                return (
                  <div
                    key={image.id}
                    className="bg-green-600 rounded px-2 py-1 text-xs text-white flex items-center justify-center relative group"
                    style={{ width: `${widthPx}px`, minWidth: '40px' }}
                    title={`${image.file_name} (${image.duration}s)`}
                  >
                    <span className="truncate">#{index + 1}</span>
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs transition-opacity rounded">
                      {image.duration}s
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Music className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Background Music</span>
            </div>
            <div className="flex gap-1 bg-slate-800 rounded p-2 min-h-[60px]">
              {music.map((musicItem) => {
                const widthPx = totalImageDuration * pixelsPerSecond;
                return (
                  <div
                    key={musicItem.id}
                    className="bg-blue-600 rounded px-3 py-2 text-xs text-white flex items-center gap-2 relative"
                    style={{ width: `${widthPx}px`, minWidth: '100px' }}
                    title={musicItem.file_name}
                  >
                    <Music className="w-3 h-3" />
                    <span className="truncate">{musicItem.file_name}</span>
                    <span className="ml-auto text-xs opacity-70">{musicItem.volume}%</span>
                  </div>
                );
              })}
              {music.length === 0 && (
                <div className="text-slate-500 text-xs py-4 px-3">No music added</div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-white">Voice Overs</span>
            </div>
            <div className="relative bg-slate-800 rounded p-2 min-h-[60px]" style={{ minWidth: `${totalImageDuration * pixelsPerSecond}px` }}>
              {voiceovers.map((vo) => {
                const leftPx = vo.start_time * pixelsPerSecond;
                return (
                  <div
                    key={vo.id}
                    className="absolute bg-purple-600 rounded px-3 py-2 text-xs text-white flex items-center gap-2 shadow-lg"
                    style={{
                      left: `${leftPx}px`,
                      minWidth: '120px',
                      top: '8px'
                    }}
                    title={`${vo.file_name} at ${formatTime(vo.start_time)}`}
                  >
                    <Mic className="w-3 h-3" />
                    <span className="truncate">{vo.file_name}</span>
                  </div>
                );
              })}
              {voiceovers.length === 0 && (
                <div className="text-slate-500 text-xs py-4 px-3">No voice overs added</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-slate-400 mb-1">Total Images</div>
            <div className="text-xl font-bold text-white">{images.length}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-slate-400 mb-1">Music Tracks</div>
            <div className="text-xl font-bold text-white">{music.length}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-slate-400 mb-1">Voice Overs</div>
            <div className="text-xl font-bold text-white">{voiceovers.length}</div>
          </div>
        </div>
      </div>

      <div className="bg-blue-600/10 border border-blue-500/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-400 mb-2">Project Settings</h4>
        <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
          <div>
            <span className="text-slate-400">Resolution:</span> {project.resolution}
          </div>
          <div>
            <span className="text-slate-400">Frame Rate:</span> {project.fps} fps
          </div>
          <div>
            <span className="text-slate-400">Default Duration:</span> {project.default_image_duration}s
          </div>
          <div>
            <span className="text-slate-400">Transition:</span> {project.transition_type}
          </div>
          <div>
            <span className="text-slate-400">Transition Duration:</span> {project.transition_duration}s
          </div>
          <div>
            <span className="text-slate-400">Default Effect:</span> {project.default_image_effect}
          </div>
        </div>
      </div>
    </div>
  );
}
