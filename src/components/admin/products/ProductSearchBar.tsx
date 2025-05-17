
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProductSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddProduct: () => void;
}

const ProductSearchBar = ({ searchQuery, onSearchChange, onAddProduct }: ProductSearchBarProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="max-w-sm">
        <Input
          placeholder="Rechercher un produit..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button onClick={onAddProduct}>
        <Plus className="h-4 w-4 mr-2" /> Ajouter un produit
      </Button>
    </div>
  );
};

export default ProductSearchBar;
