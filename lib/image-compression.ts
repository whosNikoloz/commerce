/**
 * Image compression utility to reduce file size before uploading to AWS
 * Compresses images to max 4-5MB while maintaining reasonable quality
 */

export interface CompressionOptions {
  maxWidthOrHeight?: number; // Max dimension (width or height) in pixels
  maxSizeMB?: number; // Max file size in MB
  quality?: number; // JPEG/WebP quality (0.0 - 1.0)
  fileType?: string; // Output file type (default: original or image/jpeg)
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidthOrHeight: 1920, // Max dimension
  maxSizeMB: 4, // Target max 4MB
  quality: 0.85, // 85% quality
  fileType: "image/jpeg",
};

/**
 * Compresses a single image file
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Compressed image file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {},
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // If file is already small enough and not too large in dimensions, return as-is
  const fileSizeMB = file.size / 1024 / 1024;

  if (fileSizeMB <= opts.maxSizeMB * 0.8) {
    // If it's 80% or less of target, probably fine
    const dimensions = await getImageDimensions(file);

    if (dimensions.width <= opts.maxWidthOrHeight && dimensions.height <= opts.maxWidthOrHeight) {
      return file;
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const img = new Image();

        img.onload = async () => {
          try {
            // Calculate new dimensions
            let { width, height } = img;
            const maxDim = opts.maxWidthOrHeight;

            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = (height / width) * maxDim;
                width = maxDim;
              } else {
                width = (width / height) * maxDim;
                height = maxDim;
              }
            }

            // Create canvas and draw resized image
            const canvas = document.createElement("canvas");

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");

            if (!ctx) {
              reject(new Error("Failed to get canvas context"));

              return;
            }

            // Use better image smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, width, height);

            // Try different quality levels if needed to meet size target
            let quality = opts.quality;
            let blob: Blob | null = null;
            const targetSizeBytes = opts.maxSizeMB * 1024 * 1024;

            // Start with specified quality
            blob = await canvasToBlob(canvas, opts.fileType, quality);

            // If still too large, reduce quality iteratively
            let attempts = 0;

            while (blob && blob.size > targetSizeBytes && quality > 0.5 && attempts < 5) {
              quality -= 0.1;
              blob = await canvasToBlob(canvas, opts.fileType, quality);
              attempts++;
            }

            if (!blob) {
              reject(new Error("Failed to create blob from canvas"));

              return;
            }

            // Create file from blob
            const compressedFile = new File([blob], file.name, {
              type: opts.fileType,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          } catch (err) {
            reject(err);
          }
        };

        img.onerror = () => {
          reject(new Error("Failed to load image"));
        };

        img.src = e.target?.result as string;
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compresses multiple image files
 * @param files - Array of image files to compress
 * @param options - Compression options
 * @returns Array of compressed image files
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {},
): Promise<File[]> {
  const compressionPromises = files.map((file) => compressImage(file, options));

  return Promise.all(compressionPromises);
}

/**
 * Helper to convert canvas to blob with promise
 */
function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob"));
        }
      },
      type,
      quality,
    );
  });
}

/**
 * Get image dimensions without loading full image
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        reject(new Error("Failed to load image for dimensions"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
