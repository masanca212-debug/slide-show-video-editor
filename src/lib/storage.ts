export function createObjectURL(arrayBuffer: ArrayBuffer, type: string): string {
  const blob = new Blob([arrayBuffer], { type });
  return URL.createObjectURL(blob);
}

export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url);
}

export async function loadAudioDuration(arrayBuffer: ArrayBuffer): Promise<number> {
  return new Promise((resolve) => {
    const blob = new Blob([arrayBuffer]);
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
      URL.revokeObjectURL(url);
    });

    audio.addEventListener('error', () => {
      resolve(0);
      URL.revokeObjectURL(url);
    });
  });
}

export async function loadImageDimensions(arrayBuffer: ArrayBuffer): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const blob = new Blob([arrayBuffer]);
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(url);
    };

    img.src = url;
  });
}
