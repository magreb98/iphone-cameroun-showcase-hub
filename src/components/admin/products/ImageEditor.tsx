
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Edit, Trash, Star } from "lucide-react";
import { ProductImage } from "./ProductImageManager";

interface ImageEditorProps {
  image: ProductImage;
  onUpdate: (imageId: number, newUrl: string) => void;
  onDelete: (imageId: number) => void;
  onSetMain: (imageId: number) => void;
  productId: number;
}

const ImageEditor = ({ image, onUpdate, onDelete, onSetMain, productId }: ImageEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newUrl, setNewUrl] = useState(image.url);

  const handleUpdate = () => {
    if (newUrl.trim() && newUrl !== image.url) {
      onUpdate(image.id, newUrl.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNewUrl(image.url);
    setIsEditing(false);
  };

  return (
    <div className={`relative w-24 h-24 border rounded overflow-hidden group ${image.isMain ? 'border-blue-500 border-2' : ''}`}>
      <img 
        src={image.url} 
        alt={`Image ${image.id}`} 
        className="w-full h-full object-cover"
      />
      
      {/* Action buttons - visible on hover */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 bg-blue-500 text-white hover:bg-blue-600"
              title="Modifier l'image"
            >
              <Edit className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier l'image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="imageUrl">URL de l'image</Label>
                <Input
                  id="imageUrl"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {newUrl && (
                <div>
                  <Label>Aperçu</Label>
                  <img 
                    src={newUrl} 
                    alt="Aperçu" 
                    className="w-full h-32 object-contain border rounded mt-2"
                    onError={() => setNewUrl("")}
                  />
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCancel}>
                  Annuler
                </Button>
                <Button onClick={handleUpdate} disabled={!newUrl.trim()}>
                  Sauvegarder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(image.id)}
          className="h-8 w-8 p-0 bg-red-500 text-white hover:bg-red-600"
          title="Supprimer l'image"
        >
          <Trash className="h-3 w-3" />
        </Button>

        {!image.isMain && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onSetMain(image.id)}
            className="h-8 w-8 p-0 bg-yellow-500 text-white hover:bg-yellow-600"
            title="Définir comme image principale"
          >
            <Star className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Main image indicator */}
      {image.isMain && (
        <div className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs py-1 px-2 text-center">
          Image principale
        </div>
      )}
    </div>
  );
};

export default ImageEditor;
