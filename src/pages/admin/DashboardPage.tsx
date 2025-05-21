
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/components/products/ProductCard";
import { ShoppingBag, Package, Tag, MessageCircle } from "lucide-react"; // Changed from WhatsApp to MessageCircle
import { getProducts } from "@/api/products";
import { getCategories } from "@/api/categories";
import { getConfiguration, saveConfiguration } from "@/api/configurations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const DashboardPage = () => {
  const queryClient = useQueryClient();
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: productsData } = useQuery({
    queryKey: ['products', 1],
    queryFn: () => getProducts(1, 10)
  });
  
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  // Fetch WhatsApp configuration
  const { data: whatsappConfig } = useQuery({
    queryKey: ['config', 'whatsapp_number'],
    queryFn: () => getConfiguration('whatsapp_number')
  });

  // Set WhatsApp number when config is loaded
  useEffect(() => {
    if (whatsappConfig && whatsappConfig.configValue) {
      setWhatsappNumber(whatsappConfig.configValue);
    }
  }, [whatsappConfig]);

  // Save WhatsApp configuration mutation
  const saveWhatsappMutation = useMutation({
    mutationFn: (configValue: string) => saveConfiguration({
      configKey: 'whatsapp_number',
      configValue,
      description: 'Numéro WhatsApp pour les contacts clients'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
      toast.success("Numéro WhatsApp mis à jour avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour du numéro WhatsApp");
      console.error(error);
    }
  });

  // Extract the products array from the response
  const products = productsData?.products || [];

  // Calculate statistics
  const totalProducts = products.length;
  const productsInStock = products.filter(p => p.inStock).length;
  const totalCategories = categories.length;
  const averagePrice = products.length ? 
    Math.round(products.reduce((sum, p) => sum + p.price, 0) / totalProducts) : 0;

  const handleWhatsappNumberSave = async () => {
    setLoading(true);
    try {
      // Remove any spaces and make sure it starts with +
      const formattedNumber = whatsappNumber.trim().replace(/\s+/g, '');
      const finalNumber = formattedNumber.startsWith('+') ? formattedNumber : `+${formattedNumber}`;
      
      await saveWhatsappMutation.mutateAsync(finalNumber);
      setWhatsappNumber(finalNumber);
    } catch (error) {
      console.error("Error saving WhatsApp number:", error);
    } finally {
      setLoading(false);
    }
  };

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
              <Package className="h-4 w-4 text-muted-foreground" />
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

        {/* WhatsApp Configuration */}
        {/*<Card>*/}
        {/*  <CardHeader className="flex flex-row items-center space-y-0 pb-2">*/}
        {/*    <CardTitle className="text-lg font-medium">Configuration WhatsApp</CardTitle>*/}
        {/*    <MessageCircle className="h-5 w-5 text-green-600 ml-2" />*/}
        {/*  </CardHeader>*/}
        {/*  <CardContent className="pt-4">*/}
        {/*    <div className="space-y-4">*/}
        {/*      <p className="text-sm text-gray-600">*/}
        {/*        Ce numéro sera utilisé pour recevoir des messages des clients via WhatsApp.*/}
        {/*        Assurez-vous que le numéro est valide et a un compte WhatsApp actif.*/}
        {/*      </p>*/}
        {/*      */}
        {/*      <div className="flex items-end gap-3">*/}
        {/*        <div className="flex-grow space-y-1">*/}
        {/*          <Label htmlFor="whatsappNumber">Numéro WhatsApp</Label>*/}
        {/*          <Input*/}
        {/*            id="whatsappNumber"*/}
        {/*            value={whatsappNumber}*/}
        {/*            onChange={(e) => setWhatsappNumber(e.target.value)}*/}
        {/*            placeholder="+237 6XX XXX XXX"*/}
        {/*          />*/}
        {/*        </div>*/}
        {/*        <Button */}
        {/*          onClick={handleWhatsappNumberSave}*/}
        {/*          disabled={loading || !whatsappNumber}*/}
        {/*        >*/}
        {/*          {loading ? "Sauvegarde..." : "Sauvegarder"}*/}
        {/*        </Button>*/}
        {/*      </div>*/}
        {/*      */}
        {/*      <p className="text-xs text-gray-500">*/}
        {/*        Format: +237 6XXXXXXXX (avec l'indicatif du pays)*/}
        {/*      </p>*/}
        {/*    </div>*/}
        {/*  </CardContent>*/}
        {/*</Card>*/}

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
