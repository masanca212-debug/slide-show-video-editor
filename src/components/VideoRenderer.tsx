import { useState, useEffect, useRef } from 'react';
import { createObjectURL } from '../lib/storage';
import { Download, Play, Pause, CheckCircle2, Loader2, Film } from 'lucide-react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

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
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderMessage, setRenderMessage] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

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

  const loadFFmpeg = async () => {
    if (ffmpegRef.current) return ffmpegRef.current;

    const ffmpeg = new FFmpeg();

    ffmpeg.on('log', ({ message }) => {
      console.log(message);
    });

    ffmpeg.on('progress', ({ progress }) => {
      setRenderProgress(Math.round(progress * 100));
    });

    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
    } catch (error) {
      console.error('Failed to load FFmpeg from unpkg, trying jsdelivr...', error);
      const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
    }

    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  };

  const exportVideo = async () => {
    try {
      setRendering(true);
      setRenderProgress(0);
      setRenderMessage('Initializing FFmpeg (this may take 30-60 seconds)...');

      const ffmpeg = await loadFFmpeg();

      if (!ffmpeg) {
        throw new Error('Failed to initialize FFmpeg');
      }

      setRenderMessage('Rendering frames...');
      const fps = project.fps;
      const totalFrames = Math.ceil(totalDuration * fps);
      const frames: Uint8Array[] = [];

      for (let i = 0; i < totalFrames; i++) {
        const time = i / fps;
        renderFrame(time);

        const canvas = canvasRef.current;
        if (!canvas) continue;

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png');
        });

        frames.push(new Uint8Array(await blob.arrayBuffer()));
        await ffmpeg.writeFile(`frame${i.toString().padStart(6, '0')}.png`, frames[i]);

        if (i % 10 === 0) {
          setRenderProgress(Math.round((i / totalFrames) * 50));
        }
      }

      setRenderMessage('Processing audio...');

      let hasAudio = false;
      const audioInputs: string[] = [];
      const filterComplex: string[] = [];
      let audioIndex = 0;

      if (music.length > 0) {
        for (const m of music) {
          const musicData = new Uint8Array(m.file_data);
          await ffmpeg.writeFile(`music${audioIndex}.mp3`, musicData);
          audioInputs.push(`-i music${audioIndex}.mp3`);
          audioIndex++;
          hasAudio = true;
        }
      }

      if (voiceovers.length > 0) {
        for (const v of voiceovers) {
          const voiceData = new Uint8Array(v.file_data);
          await ffmpeg.writeFile(`voice${audioIndex}.mp3`, voiceData);
          audioInputs.push(`-i voice${audioIndex}.mp3`);
          audioIndex++;
          hasAudio = true;
        }
      }

      setRenderMessage('Encoding video...');

      const ffmpegArgs = [
        '-framerate', fps.toString(),
        '-i', 'frame%06d.png',
      ];

      if (hasAudio && audioInputs.length > 0) {
        for (let i = 0; i < audioIndex; i++) {
          ffmpegArgs.push('-i', i < music.length ? `music${i}.mp3` : `voice${i - music.length}.mp3`);
        }

        if (audioIndex > 1) {
          const amixInputs = Array.from({ length: audioIndex }, (_, i) => `[${i + 1}:a]`).join('');
          ffmpegArgs.push(
            '-filter_complex',
            `${amixInputs}amix=inputs=${audioIndex}:duration=first:dropout_transition=2[aout]`,
            '-map', '0:v',
            '-map', '[aout]'
          );
        } else {
          ffmpegArgs.push('-map', '0:v', '-map', '1:a');
        }
      }

      ffmpegArgs.push(
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-pix_fmt', 'yuv420p',
        '-t', totalDuration.toFixed(2),
        'output.mp4'
      );

      await ffmpeg.exec(ffmpegArgs);

      setRenderMessage('Downloading video...');
      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title}.mp4`;
      a.click();

      URL.revokeObjectURL(url);

      setRenderMessage('Video exported successfully!');
      setRenderProgress(100);

      setTimeout(() => {
        setRendering(false);
        setRenderProgress(0);
        setRenderMessage('');
      }, 2000);

    } catch (error) {
      console.error('Export error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setRenderMessage(`Export failed: ${errorMessage}. Please refresh and try again.`);
      setTimeout(() => {
        setRendering(false);
        setRenderProgress(0);
        setRenderMessage('');
      }, 5000);
    }
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
                  onClick={exportVideo}
                  disabled={rendering}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {rendering ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Rendering...</span>
                    </>
                  ) : (
                    <>
                      <Film className="w-5 h-5" />
                      <span>Export Video</span>
                    </>
                  )}
                </button>
              </div>

              {rendering && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300 font-medium">{renderMessage}</span>
                      <span className="text-green-400 font-bold">{renderProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-400 h-full transition-all duration-300"
                        style={{ width: `${renderProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      Please wait, this may take a few minutes depending on video length...
                    </p>
                  </div>
                </div>
              )}

              {!rendering && (
                <div className="space-y-3">
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-slate-300">
                        <p className="font-medium mb-1">Full Offline Video Export</p>
                        <p className="text-slate-400">
                          Click "Export Video" to render your project into an MP4 video file with all effects,
                          music, and voiceovers. Video processing happens entirely in your browser using FFmpeg WebAssembly.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                    <div className="text-sm text-slate-300">
                      <p className="font-medium mb-2">Important Notes:</p>
                      <ul className="list-disc list-inside space-y-1 text-slate-400">
                        <li>First export will download FFmpeg (~30MB) - takes 30-60 seconds</li>
                        <li>Keep this browser tab open during rendering</li>
                        <li>Don't refresh or close tab while rendering</li>
                        <li>For best results, use Chrome or Edge browser</li>
                        <li>Rendering time: ~2-5 minutes per minute of video</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
