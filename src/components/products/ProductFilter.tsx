import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

export interface FilterOptions {
  category: string | null;
  minPrice: number;
  maxPrice: number;
  inStock: boolean | null;
  brand: string | null;
}

interface ProductFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  categories: string[];
  brands: string[];
}

const ProductFilter = ({ onFilterChange, categories, brands }: ProductFilterProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    category: null,
    minPrice: 0,
    maxPrice: 1000000,
    inStock: null,
    brand: null,
  });

  const handleFilterChange = (
    key: keyof FilterOptions,
    value: string | number | boolean | null
  ) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (value: number[]) => {
    const newFilters = {
      ...filters,
      minPrice: value[0],
      maxPrice: value[1],
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      category: null,
      minPrice: 0,
      maxPrice: 1000000,
      inStock: null,
      brand: null,
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="mb-6">
      <div className="md:hidden mb-4">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <Filter className="mr-2 h-4 w-4" />
          {isFilterOpen ? "Masquer les filtres" : "Afficher les filtres"}
        </Button>
      </div>

      <div className={`${isFilterOpen ? 'block' : 'hidden'} md:block space-y-6 bg-white p-4 rounded-lg border`}>
        <h3 className="font-semibold text-lg mb-2">Filtres</h3>

        {/* Catégorie */}
        <div>
          <h4 className="font-medium mb-2">Catégorie</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center">
                <Checkbox
                  id={`category-${category}`}
                  checked={filters.category === category}
                  onCheckedChange={(checked) =>
                    handleFilterChange("category", checked ? category : null)
                  }
                />
                <Label
                  htmlFor={`category-${category}`}
                  className="ml-2 text-sm font-normal"
                >
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Prix */}
        <div>
          <h4 className="font-medium mb-2">Prix (FCFA)</h4>
          <div className="space-y-4">
            <Slider
              defaultValue={[filters.minPrice, filters.maxPrice]}
              max={1000000}
              step={10000}
              onValueChange={handlePriceChange}
            />
            <div className="flex items-center justify-between">
              <Input
                type="number"
                value={filters.minPrice}
                onChange={(e) =>
                  handleFilterChange("minPrice", parseInt(e.target.value) || 0)
                }
                className="w-24 text-sm"
              />
              <span className="text-sm text-gray-500">à</span>
              <Input
                type="number"
                value={filters.maxPrice}
                onChange={(e) =>
                  handleFilterChange("maxPrice", parseInt(e.target.value) || 0)
                }
                className="w-24 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Disponibilité */}
        <div>
          <h4 className="font-medium mb-2">Disponibilité</h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <Checkbox
                id="inStock"
                checked={filters.inStock === true}
                onCheckedChange={(checked) =>
                  handleFilterChange("inStock", checked ? true : null)
                }
              />
              <Label
                htmlFor="inStock"
                className="ml-2 text-sm font-normal"
              >
                En stock uniquement
              </Label>
            </div>
          </div>
        </div>

        {/* Brand */}
        <div>
          <h4 className="font-medium mb-2">Marque</h4>
          <div className="space-y-2">
            {brands.map((brand) => (
              <div key={brand} className="flex items-center">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={filters.brand === brand}
                  onCheckedChange={(checked) =>
                    handleFilterChange("brand", checked ? brand : null)
                  }
                />
                <Label
                  htmlFor={`brand-${brand}`}
                  className="ml-2 text-sm font-normal"
                >
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          onClick={resetFilters}
          className="w-full mt-4"
        >
          Réinitialiser les filtres
        </Button>
      </div>
    </div>
  );
};

export default ProductFilter;
