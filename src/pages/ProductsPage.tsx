
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import ProductCard, { Product } from "@/components/products/ProductCard";
import ProductFilter, { FilterOptions } from "@/components/products/ProductFilter";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { getProducts } from "@/api/products";
import { getCategories } from "@/api/categories";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });
  
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  // Liste des catégories et marques
  const categoryNames = categories.map(c => c.name);
  const brands = ["Apple"]; // Hardcoded pour l'instant, pourrait venir de l'API

  useEffect(() => {
    // Initialiser les produits filtrés avec tous les produits
    setFilteredProducts(products);
    
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
  }, [searchParams, products]);

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

  if (isLoadingProducts || isLoadingCategories) {
    return (
      <MainLayout>
        <section className="py-12 bg-apple-gray">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <p>Chargement des produits...</p>
            </div>
          </div>
        </section>
      </MainLayout>
    );
  }

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
                categories={categoryNames}
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
