
import { Label } from "@/components/ui/label";
import ImageEditor from "./ImageEditor";
import { ProductImage } from "./ProductImageManager";

interface ExistingImagesGridProps {
  productId: number;
  existingImages: ProductImage[];
  onUpdateImage: (imageId: number, newUrl: string) => void;
  onDeleteImage: (imageId: number) => void;
  onSetMainImage: (imageId: number) => void;
}

const ExistingImagesGrid = ({ 
  productId, 
  existingImages, 
  onUpdateImage, 
  onDeleteImage, 
  onSetMainImage 
}: ExistingImagesGridProps) => {
  if (!productId || existingImages.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-4 items-start gap-4">
      <Label className="text-right pt-2">
        Images existantes
      </Label>
      <div className="col-span-3">
        <div className="flex flex-wrap gap-2">
          {existingImages.map((image) => (
            <ImageEditor
              key={image.id}
              image={image}
              onUpdate={onUpdateImage}
              onDelete={onDeleteImage}
              onSetMain={onSetMainImage}
              productId={productId}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExistingImagesGrid;
