
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Category } from "@/api/categories";
import { Location } from "@/api/locations";

interface ProductBasicFieldsProps {
  name: string;
  price: number;
  quantity: number;
  inStock: boolean;
  categoryId: number;
  locationId: number;
  categories: Category[];
  locations: Location[];
  isSuperAdmin: boolean;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  onQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSwitchChange: (checked: boolean) => void;
  onCategoryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
}

const ProductFormFields = ({
  name,
  price,
  quantity,
  inStock,
  categoryId,
  locationId,
  categories,
  locations,
  isSuperAdmin,
  onNameChange,
  onPriceChange,
  onQuantityChange,
  onSwitchChange,
  onCategoryChange,
  onLocationChange
}: ProductBasicFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Nom
        </Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={onNameChange}
          className="col-span-3"
          required
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="price" className="text-right">
          Prix (FCFA)
        </Label>
        <Input
          id="price"
          name="price"
          type="number"
          value={price}
          onChange={onPriceChange}
          className="col-span-3"
          required
          min="0"
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="category" className="text-right">
          Catégorie
        </Label>
        <Select
          value={categoryId.toString()}
          onValueChange={(value) => onCategoryChange(value)}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Sélectionnez une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location input - only visible for super admins */}
      {isSuperAdmin && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="location" className="text-right">
            Emplacement
          </Label>
          <Select
            value={locationId.toString()}
            onValueChange={(value) => onLocationChange(value)}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Sélectionnez un emplacement" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id.toString()}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="quantity" className="text-right">
          Quantité
        </Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          value={quantity}
          onChange={onQuantityChange}
          className="col-span-3"
          required
          min="0"
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="inStock" className="text-right">
          En stock
        </Label>
        <div className="col-span-3 flex items-center space-x-2">
          <Switch
            id="inStock"
            checked={inStock}
            onCheckedChange={onSwitchChange}
          />
          <Label htmlFor="inStock">
            {inStock ? "Disponible" : "Indisponible"}
          </Label>
        </div>
      </div>
    </>
  );
};

export default ProductFormFields;
