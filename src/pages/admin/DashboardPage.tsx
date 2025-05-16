
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/components/products/ProductCard";
import { ShoppingBag, Package, Tag, Search } from "lucide-react";

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
  }
];

const DashboardPage = () => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);

  // Calcul des statistiques
  const totalProducts = products.length;
  const productsInStock = products.filter(p => p.inStock).length;
  const totalCategories = [...new Set(products.map(p => p.category))].length;
  const averagePrice = products.reduce((sum, p) => sum + p.price, 0) / totalProducts;

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
                {((productsInStock / totalProducts) * 100).toFixed(0)}% disponibles
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
                {products.map((product) => (
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
