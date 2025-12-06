import { useState, useRef } from 'react';
import { db } from '../lib/db';
import { createObjectURL, loadImageDimensions } from '../lib/storage';
import { useAuth } from '../contexts/AuthContext';
import { Upload, X, GripVertical, Clock, Loader2, Sparkles } from 'lucide-react';

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

type EffectType = 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down' | 'zoom-pan-left' | 'zoom-pan-right' | 'rotate-zoom' | 'none' | 'random';

interface ImageUploaderProps {
  projectId: string;
  images: ProjectImage[];
  onUpdate: () => void;
}

export function ImageUploader({ projectId, images, onUpdate }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
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
        const dimensions = await loadImageDimensions(arrayBuffer);

        await db.images.create(projectId, user.id, file, {
          start_time: images.length + i,
          duration: 5,
          layer: images.length + i,
          width: dimensions.width,
          height: dimensions.height,
          effects: JSON.stringify({ type: 'zoom-in' }),
        });
      }

      onUpdate();
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteImage = async (image: ProjectImage) => {
    try {
      await db.images.delete(image.id);
      const url = imageUrls.get(image.id);
      if (url) {
        URL.revokeObjectURL(url);
        imageUrls.delete(image.id);
      }
      onUpdate();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const updateDuration = async (imageId: string, duration: number) => {
    try {
      await db.images.update(imageId, { duration });
      onUpdate();
    } catch (error) {
      console.error('Error updating duration:', error);
    }
  };

  const updateEffect = async (imageId: string, effect: string) => {
    try {
      await db.images.update(imageId, {
        effects: JSON.stringify({ type: effect }),
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating effect:', error);
    }
  };

  const effectOptions: { value: EffectType; label: string }[] = [
    { value: 'zoom-in', label: 'Zoom In' },
    { value: 'zoom-out', label: 'Zoom Out' },
    { value: 'pan-left', label: 'Pan Left' },
    { value: 'pan-right', label: 'Pan Right' },
    { value: 'pan-up', label: 'Pan Up' },
    { value: 'pan-down', label: 'Pan Down' },
    { value: 'zoom-pan-left', label: 'Zoom + Pan Left' },
    { value: 'zoom-pan-right', label: 'Zoom + Pan Right' },
    { value: 'rotate-zoom', label: 'Rotate Zoom' },
    { value: 'none', label: 'None (Static)' },
    { value: 'random', label: 'Random' },
  ];

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
  };

  const getImageUrl = (image: ProjectImage) => {
    if (!imageUrls.has(image.id)) {
      const url = createObjectURL(image.file_data, image.file_type);
      setImageUrls(new Map(imageUrls.set(image.id, url)));
      return url;
    }
    return imageUrls.get(image.id)!;
  };

  const getEffectFromJSON = (effectsJson: string): string => {
    try {
      const parsed = JSON.parse(effectsJson);
      return parsed.type || 'zoom-in';
    } catch {
      return 'zoom-in';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Image Slides</h3>
          <p className="text-sm text-slate-400">Upload and arrange images for your video</p>
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
              <span>Upload Images</span>
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {images.length === 0 ? (
        <div className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center">
          <Upload className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">No images uploaded yet</p>
          <p className="text-sm text-slate-500">Click "Upload Images" to add photos to your video</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className="bg-slate-700 rounded-lg overflow-hidden border border-slate-600 hover:border-blue-500 transition-all cursor-move group"
            >
              <div className="relative aspect-video">
                <img
                  src={getImageUrl(image)}
                  alt={image.file_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur px-2 py-1 rounded flex items-center gap-1 text-xs text-white">
                  <GripVertical className="w-3 h-3" />
                  <span>#{index + 1}</span>
                </div>
                <button
                  onClick={() => deleteImage(image)}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3 space-y-2">
                <p className="text-sm text-white truncate">{image.file_name}</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    max="30"
                    step="0.5"
                    value={image.duration}
                    onChange={(e) => updateDuration(image.id, parseFloat(e.target.value))}
                    className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-400">sec</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  <select
                    value={getEffectFromJSON(image.effects)}
                    onChange={(e) => updateEffect(image.id, e.target.value)}
                    className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {effectOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
