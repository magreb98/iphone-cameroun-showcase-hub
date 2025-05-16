
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import ProductCard, { Product } from "@/components/products/ProductCard";
import ProductFilter, { FilterOptions } from "@/components/products/ProductFilter";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Données fictives pour la démonstration
const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "iPhone 13 Pro Max",
    imageUrl: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=500",
    price: 850000,
    category: "iPhone",
    inStock: true,
    quantity: 10
  },
  {
    id: 2,
    name: "MacBook Pro 14",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500",
    price: 1200000,
    category: "MacBook",
    inStock: true,
    quantity: 5
  },
  {
    id: 3,
    name: "iPad Pro 12.9",
    imageUrl: "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=500",
    price: 700000,
    category: "iPad",
    inStock: false,
    quantity: 0
  },
  {
    id: 4,
    name: "AirPods Pro",
    imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=500",
    price: 120000,
    category: "Accessory",
    inStock: true,
    quantity: 15
  },
  {
    id: 5,
    name: "iPhone 14",
    imageUrl: "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?auto=format&fit=crop&w=500",
    price: 750000,
    category: "iPhone",
    inStock: true,
    quantity: 8
  },
  {
    id: 6,
    name: "MacBook Air M2",
    imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=500",
    price: 950000,
    category: "MacBook",
    inStock: true,
    quantity: 3
  },
  {
    id: 7,
    name: "Apple Watch Series 7",
    imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=500",
    price: 280000,
    category: "Accessory",
    inStock: false,
    quantity: 0
  },
  {
    id: 8,
    name: "iPad Mini",
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=500",
    price: 450000,
    category: "iPad",
    inStock: true,
    quantity: 7
  }
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");

  // Liste des catégories et marques (normalement récupérées de l'API)
  const categories = ["iPhone", "MacBook", "iPad", "Accessory"];
  const brands = ["Apple"];

  useEffect(() => {
    // Récupérer le paramètre de catégorie de l'URL si présent
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      filterProducts({
        category: categoryParam,
        minPrice: 0,
        maxPrice: 1000000,
        inStock: null,
        brand: null
      });
    }
  }, [searchParams]);

  const filterProducts = (filters: FilterOptions) => {
    let filtered = [...products];

    // Filtre par catégorie
    if (filters.category) {
      filtered = filtered.filter((product) => product.category === filters.category);
    }

    // Filtre par prix
    filtered = filtered.filter(
      (product) => product.price >= filters.minPrice && product.price <= filters.maxPrice
    );

    // Filtre par disponibilité
    if (filters.inStock !== null) {
      filtered = filtered.filter((product) => product.inStock === filters.inStock);
    }

    // Filtre par marque
    if (filters.brand) {
      filtered = filtered.filter((product) => product.category.includes(filters.brand));
    }

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterProducts({
      category: null,
      minPrice: 0,
      maxPrice: 1000000,
      inStock: null,
      brand: null,
    });
  };

  return (
    <MainLayout>
      <section className="py-12 bg-apple-gray">
        <div className="container mx-auto px-4">
          <h1 className="section-title mb-8 text-center">Nos Produits</h1>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar with Filters */}
            <aside className="lg:col-span-1">
              <ProductFilter
                onFilterChange={filterProducts}
                categories={categories}
                brands={brands}
              />
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-lg text-gray-500">
                    Aucun produit ne correspond à vos critères de recherche.
                  </p>
                </div>
              ) : (
                <div className="product-grid">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default ProductsPage;
