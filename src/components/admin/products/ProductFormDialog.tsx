
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProductFormData } from "@/api/products";
import { Category } from "@/api/categories";
import { Location } from "@/api/locations";
import ProductFormFields from "@/components/admin/products/ProductFormFields";
import ProductImageManager from "@/components/admin/products/ProductImageManager";
import { useProductForm } from "@/hooks/useProductForm";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: ProductFormData | null;
  categories: Category[];
  locations: Location[];
}

const ProductFormDialog = ({ 
  open, 
  onOpenChange, 
  editingProduct, 
  categories, 
  locations 
}: ProductFormDialogProps) => {
  const handleCloseDialog = () => {
    onOpenChange(false);
  };

  const { 
    formData,
    isSuperAdmin,
    selectedFiles,
    existingImages,
    setExistingImages,
    handleChange,
    handleSelectChange,
    handleSwitchChange,
    handleSubmit,
    isSubmitting
  } = useProductForm(editingProduct, handleCloseDialog);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? "Modifier le produit" : "Ajouter un produit"}
          </DialogTitle>
          <DialogDescription>
            Remplissez les informations du produit ci-dessous.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <ProductFormFields
              name={formData.name}
              price={formData.price}
              quantity={formData.quantity}
              inStock={formData.inStock}
              categoryId={formData.categoryId}
              locationId={formData.locationId}
              categories={categories}
              locations={locations}
              isSuperAdmin={isSuperAdmin}
              onNameChange={handleChange}
              onPriceChange={handleChange}
              onQuantityChange={handleChange}
              onSwitchChange={handleSwitchChange}
              onCategoryChange={(value) => handleSelectChange(value, "categoryId")}
              onLocationChange={(value) => handleSelectChange(value, "locationId")}
            />

            <ProductImageManager
              productId={editingProduct?.id}
              imageUrl={formData.imageUrl}
              setImageUrl={(url) => {
                handleChange({
                  target: { name: "imageUrl", value: url, type: "text" }
                } as React.ChangeEvent<HTMLInputElement>);
              }}
              existingImages={existingImages}
              setExistingImages={setExistingImages}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseDialog}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Traitement..." : (editingProduct ? "Mettre à jour" : "Ajouter")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
