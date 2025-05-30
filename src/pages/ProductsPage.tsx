
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import ProductCard, { Product } from "@/components/products/ProductCard";
import ProductFilter, { FilterOptions } from "@/components/products/ProductFilter";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { getProducts, PaginationData } from "@/api/products";
import { getCategories } from "@/api/categories";
import { getLocations } from "@/api/locations";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Synchroniser l'état 'page' avec les paramètres d'URL
  const pageParam = searchParams.get("page");
  const page = pageParam ? parseInt(pageParam) : 1;

  // Obtenir l'ID de la catégorie à partir des paramètres d'URL
  const categoryParam = searchParams.get("category");
  const categoryId = categoryParam ? parseInt(categoryParam) : undefined;

  // Obtenir l'ID de l'emplacement à partir des paramètres d'URL
  const locationParam = searchParams.get("location");
  const locationId = locationParam ? parseInt(locationParam) : undefined;

  // Récupérer les produits avec pagination et filtres de catégorie/emplacement
  const { data, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', page, categoryId, locationId],
    queryFn: () => getProducts(page, 12, categoryId, locationId)
  });

  const products = data?.products || [];
  const pagination: PaginationData = data?.pagination || {
    total: 0,
    page: 1,
    limit: 12,
    pages: 1,
    hasMore: false
  };

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locations'],
    queryFn: getLocations
  });

  // Liste des noms de catégories et des emplacements
  const categoryNames = categories.map(c => c.name);
  const locationNames = locations.map(l => l.name);
  const brands = ["Apple"]; // Codé en dur pour l'instant

  // Effet pour filtrer les produits en fonction de la requête de recherche
  useEffect(() => {
    if (products.length > 0) {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        setFilteredProducts(products.filter((product) =>
          product.name.toLowerCase().includes(query)
        ));
      } else {
        setFilteredProducts(products);
      }
    }
  }, [searchQuery, products]);

  const filterProducts = (filters: FilterOptions) => {
    // Mettre à jour l'URL avec la catégorie et l'emplacement
    const newSearchParams = new URLSearchParams(searchParams.toString());
    
    if (filters.category) {
      const categoryObj = categories.find(c => c.name === filters.category);
      if (categoryObj) {
        newSearchParams.set("category", categoryObj.id.toString());
      }
    } else {
      newSearchParams.delete("category");
    }
    
    if (filters.location) {
      const locationObj = locations.find(l => l.name === filters.location);
      if (locationObj) {
        newSearchParams.set("location", locationObj.id.toString());
      }
    } else {
      newSearchParams.delete("location");
    }
    
    newSearchParams.delete("page"); // Réinitialiser à la page 1 lors du changement de filtre
    setSearchParams(newSearchParams);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const handlePageChange = (newPage: number) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("page", newPage.toString());
    setSearchParams(newSearchParams);
    window.scrollTo(0, 0);
  };

  if (isLoadingProducts || isLoadingCategories || isLoadingLocations) {
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

          {/* Barre de recherche */}
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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Barre latérale avec filtres */}
            <aside className="lg:col-span-1">
              <ProductFilter
                onFilterChange={filterProducts}
                categories={categoryNames}
                brands={brands}
                locations={locationNames}
              />
            </aside>

            {/* Grille de produits */}
            <div className="lg:col-span-3">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-lg text-gray-500">
                    Aucun produit ne correspond à vos critères de recherche.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="mt-8">
                    <Pagination>
                      <PaginationContent>
                        {page > 1 && (
                          <PaginationItem>
                            <PaginationPrevious onClick={() => handlePageChange(page - 1)} />
                          </PaginationItem>
                        )}

                        {/* Première page */}
                        {page > 2 && (
                          <PaginationItem>
                            <PaginationLink onClick={() => handlePageChange(1)}>
                              1
                            </PaginationLink>
                          </PaginationItem>
                        )}

                        {/* Ellipsis pour de nombreuses pages */}
                        {page > 3 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}

                        {/* Page précédente */}
                        {page > 1 && (
                          <PaginationItem>
                            <PaginationLink onClick={() => handlePageChange(page - 1)}>
                              {page - 1}
                            </PaginationLink>
                          </PaginationItem>
                        )}

                        {/* Page actuelle */}
                        <PaginationItem>
                          <PaginationLink isActive>{page}</PaginationLink>
                        </PaginationItem>

                        {/* Page suivante */}
                        {page < pagination.pages && (
                          <PaginationItem>
                            <PaginationLink onClick={() => handlePageChange(page + 1)}>
                              {page + 1}
                            </PaginationLink>
                          </PaginationItem>
                        )}

                        {/* Ellipsis pour de nombreuses pages */}
                        {page < pagination.pages - 2 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}

                        {/* Dernière page */}
                        {page < pagination.pages - 1 && (
                          <PaginationItem>
                            <PaginationLink onClick={() => handlePageChange(pagination.pages)}>
                              {pagination.pages}
                            </PaginationLink>
                          </PaginationItem>
                        )}

                        {page < pagination.pages && (
                          <PaginationItem>
                            <PaginationNext onClick={() => handlePageChange(page + 1)} />
                          </PaginationItem>
                        )}
                      </PaginationContent>
                    </Pagination>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default ProductsPage;
