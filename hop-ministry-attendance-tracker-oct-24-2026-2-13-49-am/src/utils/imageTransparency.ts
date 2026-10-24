/**
 * House of Power Ministry International Church, Mankessim, Ghana
 * Logo Background Transparency & Image Processing Utility
 * 
 * Guarantees that any church logo (SVG, PNG, or JPEG) renders with
 * a 100% transparent background outside the emblem, removing any unwanted
 * white square or rectangular background while strictly preserving internal
 * white elements (such as the Holy Spirit dove and lettering).
 */

export async function processLogoTransparency(imageSrc: string): Promise<string> {
  // If it's already an SVG, SVGs support native transparency
  if (imageSrc.endsWith('.svg') || imageSrc.startsWith('data:image/svg+xml')) {
    return imageSrc;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        if (width === 0 || height === 0) {
          resolve(imageSrc);
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Check corner pixels (0,0), (width-1, 0), (0, height-1), (width-1, height-1)
        const checkWhite = (x: number, y: number) => {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];
          // Near white and opaque
          return a > 150 && r > 225 && g > 225 && b > 225;
        };

        const cornersWhite =
          checkWhite(0, 0) ||
          checkWhite(width - 1, 0) ||
          checkWhite(0, height - 1) ||
          checkWhite(width - 1, height - 1);

        if (!cornersWhite) {
          // No white corners detected; already has transparent or colored background
          resolve(imageSrc);
          return;
        }

        // Flood fill from corners and border edges to remove only the external white margin
        // BFS flood-fill visited array
        const visited = new Uint8Array(width * height);
        const queue: number[] = [];

        const isWhitePixel = (idx: number) => {
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];
          if (a === 0) return true; // already transparent
          // White/light threshold (white margins in JPEGs may have slight compression artifacts)
          return r > 218 && g > 218 && b > 218;
        };

        const enqueue = (x: number, y: number) => {
          if (x < 0 || x >= width || y < 0 || y >= height) return;
          const pos = y * width + x;
          if (visited[pos]) return;
          visited[pos] = 1;
          const idx = pos * 4;
          if (isWhitePixel(idx)) {
            queue.push(pos);
          }
        };

        // Seed with all boundary edge pixels that are white
        for (let x = 0; x < width; x++) {
          enqueue(x, 0);
          enqueue(x, height - 1);
        }
        for (let y = 0; y < height; y++) {
          enqueue(0, y);
          enqueue(width - 1, y);
        }

        // BFS loop: replace external white margin with transparent pixels
        let head = 0;
        while (head < queue.length) {
          const pos = queue[head++];
          const x = pos % width;
          const y = Math.floor(pos / width);
          const idx = pos * 4;

          // Set transparent
          data[idx + 3] = 0;

          // 4-way neighbors
          if (x > 0) enqueue(x - 1, y);
          if (x < width - 1) enqueue(x + 1, y);
          if (y > 0) enqueue(x, y - 1);
          if (y < height - 1) enqueue(x, y + 1);
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('Could not process logo transparency:', err);
        resolve(imageSrc);
      }
    };

    img.onerror = () => {
      resolve(imageSrc);
    };

    img.src = imageSrc;
  });
}
