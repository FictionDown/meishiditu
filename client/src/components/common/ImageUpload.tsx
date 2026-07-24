import { useRef, useState } from 'react';

interface ImageUploadProps {
  images: File[];
  existingImages?: string[];
  onImagesChange: (images: File[], existing: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({
  images,
  existingImages = [],
  onImagesChange,
  maxImages = 6,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...images, ...files].slice(0, maxImages);

    // Generate previews
    const newPreviews = newImages.map((f) => URL.createObjectURL(f));
    // Revoke old previews
    previews.forEach((p) => URL.revokeObjectURL(p));
    setPreviews(newPreviews);

    onImagesChange(newImages, existingImages);
  };

  const removeNewImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    URL.revokeObjectURL(previews[index]);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    onImagesChange(newImages, existingImages);
  };

  const removeExistingImage = (index: number) => {
    const newExisting = existingImages.filter((_, i) => i !== index);
    onImagesChange(images, newExisting);
  };

  const totalCount = images.length + existingImages.length;

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {/* Existing images */}
        {existingImages.map((url, i) => (
          <div key={`existing-${i}`} className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeExistingImage(i)}
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        ))}

        {/* New image previews */}
        {previews.map((url, i) => (
          <div key={`new-${i}`} className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeNewImage(i)}
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        ))}

        {/* Add button */}
        {totalCount < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-400 transition"
          >
            <span className="text-2xl">+</span>
            <span className="text-xs mt-1">上传图片</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-gray-400 mt-2">
        支持 JPG/PNG/WebP，最多{maxImages}张，单张不超过5MB
      </p>
    </div>
  );
}
