
import { Input } from "@/components/ui/input";

interface ImageUrlTabProps {
  imageUrl: string;
  onUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPreview: boolean;
}

const ImageUrlTab = ({ imageUrl, onUrlChange, showPreview }: ImageUrlTabProps) => {
  return (
    <div className="mt-2">
      <Input
        id="imageUrl"
        name="imageUrl"
        placeholder="https://example.com/image.jpg"
        value={imageUrl}
        onChange={onUrlChange}
      />
      
      {showPreview && imageUrl && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-1">Aperçu:</p>
          <img 
            src={imageUrl} 
            alt="Aperçu" 
            className="h-24 object-contain border rounded"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUrlTab;
