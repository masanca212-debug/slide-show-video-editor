import { useState, useEffect, useRef } from 'react';
import { createObjectURL } from '../lib/storage';
import { Download, Play, Pause, CheckCircle2, Loader2 } from 'lucide-react';

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

interface VideoRendererProps {
  project: Project;
  images: ProjectImage[];
  music: ProjectMusic[];
  voiceovers: ProjectVoiceover[];
  onClose: () => void;
}

interface LoadedImage {
  element: HTMLImageElement;
  image: ProjectImage;
}

export function VideoRenderer({ project, images, music, voiceovers, onClose }: VideoRendererProps) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [loadedImages, setLoadedImages] = useState<LoadedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const width = project.width;
  const height = project.height;
  const totalDuration = images.reduce((sum, img) => sum + img.duration, 0);

  useEffect(() => {
    preloadImages();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [images]);

  useEffect(() => {
    if (loadedImages.length > 0) {
      renderFrame(currentTime);
    }
  }, [loadedImages, currentTime]);

  useEffect(() => {
    if (playing) {
      const startTime = performance.now() - currentTime * 1000;

      const animate = () => {
        const elapsed = (performance.now() - startTime) / 1000;
        if (elapsed >= totalDuration) {
          setPlaying(false);
          setCurrentTime(0);
        } else {
          setCurrentTime(elapsed);
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [playing, totalDuration]);

  const preloadImages = async () => {
    setLoading(true);
    const loaded: LoadedImage[] = [];

    for (const image of images) {
      try {
        const url = createObjectURL(image.file_data, image.file_type);
        const img = new Image();

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });

        loaded.push({ element: img, image });
      } catch (error) {
        console.error('Error loading image:', error);
      }
    }

    setLoadedImages(loaded);
    setLoading(false);
  };

  const renderFrame = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    let accumulatedTime = 0;
    for (const loaded of loadedImages) {
      const imageStart = accumulatedTime;
      const imageEnd = accumulatedTime + loaded.image.duration;

      if (time >= imageStart && time < imageEnd) {
        const progress = (time - imageStart) / loaded.image.duration;
        drawImageWithEffect(ctx, loaded, progress);
        break;
      }

      accumulatedTime += loaded.image.duration;
    }
  };

  const drawImageWithEffect = (
    ctx: CanvasRenderingContext2D,
    loaded: LoadedImage,
    progress: number
  ) => {
    const img = loaded.element;
    const effect = JSON.parse(loaded.image.effects || '{}').type || 'none';

    ctx.save();

    const scale = Math.min(width / img.width, height / img.height);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const x = (width - scaledWidth) / 2;
    const y = (height - scaledHeight) / 2;

    ctx.translate(width / 2, height / 2);

    if (effect === 'zoom-in') {
      const zoomScale = 1 + progress * 0.2;
      ctx.scale(zoomScale, zoomScale);
    } else if (effect === 'zoom-out') {
      const zoomScale = 1.2 - progress * 0.2;
      ctx.scale(zoomScale, zoomScale);
    }

    ctx.translate(-width / 2, -height / 2);
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

    ctx.restore();
  };

  const exportToJSON = () => {
    const exportData = {
      project: {
        id: project.id,
        title: project.title,
        width: project.width,
        height: project.height,
        fps: project.fps,
      },
      images: images.map(img => ({
        fileName: img.file_name,
        duration: img.duration,
        effects: img.effects,
        layer: img.layer,
      })),
      music: music.map(m => ({
        fileName: m.file_name,
        volume: m.volume,
        duration: m.duration,
      })),
      voiceovers: voiceovers.map(v => ({
        fileName: v.file_name,
        startTime: v.start_time,
        volume: v.volume,
      })),
      totalDuration,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const togglePlayback = () => {
    setPlaying(!playing);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-6xl w-full border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Video Preview</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-400">Loading assets...</p>
          </div>
        ) : (
          <>
            <div className="bg-black rounded-lg overflow-hidden mb-6">
              <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="w-full h-auto"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlayback}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  <span>{playing ? 'Pause' : 'Play'}</span>
                </button>

                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max={totalDuration}
                    step="0.1"
                    value={currentTime}
                    onChange={(e) => {
                      setPlaying(false);
                      setCurrentTime(parseFloat(e.target.value));
                    }}
                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-sm text-slate-400 mt-1">
                    <span>{currentTime.toFixed(1)}s</span>
                    <span>{totalDuration.toFixed(1)}s</span>
                  </div>
                </div>

                <button
                  onClick={exportToJSON}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>Export JSON</span>
                </button>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-300">
                    <p className="font-medium mb-1">Offline Mode</p>
                    <p className="text-slate-400">
                      Preview shows slideshow animation. Export project as JSON to save configuration.
                      Full video rendering requires online services or desktop software.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
