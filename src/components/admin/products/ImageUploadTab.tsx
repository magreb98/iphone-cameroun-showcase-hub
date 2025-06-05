
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface ImageUploadTabProps {
  onFileSelect: (files: File[]) => void;
  previewImages: string[];
  onRemoveImage: (index: number) => void;
}

const ImageUploadTab = ({ onFileSelect, previewImages, onRemoveImage }: ImageUploadTabProps) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      onFileSelect(newFiles);
    }
  };

  return (
    <div className="mt-2">
      <Input
        id="imageUpload"
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
      />
      
      {previewImages.length > 0 && (
        <div className="mt-3">
          <p className="text-sm text-muted-foreground mb-2">
            {previewImages.length} image(s) sélectionnée(s)
          </p>
          <div className="flex flex-wrap gap-2">
            {previewImages.map((preview, index) => (
              <div key={index} className="relative w-16 h-16 border rounded overflow-hidden">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadTab;
