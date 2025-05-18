
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/components/products/ProductCard";
import { ShoppingBag, Package, Tag, Search } from "lucide-react";
import { getProducts } from "@/api/products";
import { getCategories } from "@/api/categories";

const DashboardPage = () => {
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => getProducts(1, 10) // Define an async function that calls getProducts
  });
  
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  // Extract the products array from the response
  const products = productsData?.products || [];

  // Calculate statistics
  const totalProducts = products.length;
  const productsInStock = products.filter(p => p.inStock).length;
  const totalCategories = categories.length;
  const averagePrice = products.length ? 
    products.reduce((sum, p) => sum + p.price, 0) / totalProducts : 0;

  if (isLoadingProducts || isLoadingCategories) {
    return (
      <AdminLayout title="Tableau de Bord">
        <div className="flex justify-center items-center h-64">
          <p>Chargement des données...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Tableau de Bord">
      <div className="space-y-8">
        {/* Cards Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Produits
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {productsInStock} en stock
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Produits en Stock
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {productsInStock} / {totalProducts}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalProducts > 0 ? ((productsInStock / totalProducts) * 100).toFixed(0) : 0}% disponibles
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Catégories
              </CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCategories}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Catégories actives
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Prix Moyen
              </CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {averagePrice.toLocaleString()} FCFA
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tous produits confondus
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Products */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Produits récents</h2>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left font-medium">Produit</th>
                  <th className="p-3 text-left font-medium">Catégorie</th>
                  <th className="p-3 text-left font-medium">Prix (FCFA)</th>
                  <th className="p-3 text-left font-medium">Stock</th>
                  <th className="p-3 text-left font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 5).map((product) => (
                  <tr key={product.id} className="border-t border-gray-200 hover:bg-muted/50">
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded bg-gray-100 overflow-hidden">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-3">{product.category}</td>
                    <td className="p-3">{product.price.toLocaleString()}</td>
                    <td className="p-3">{product.quantity}</td>
                    <td className="p-3">
                      {product.inStock ? (
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                          En stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800">
                          Rupture
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
