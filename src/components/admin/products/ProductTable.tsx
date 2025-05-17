
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Tag } from "lucide-react";
import { Product } from "@/components/products/ProductCard";
import { deleteProduct } from "@/api/products";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onPromotion: (product: Product) => void;
}

const ProductTable = ({ products, onEdit, onPromotion }: ProductTableProps) => {
  const queryClient = useQueryClient();
  
  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Produit supprimé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression du produit");
      console.error(error);
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit?")) {
      deleteProductMutation.mutate(id);
    }
  };

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-3 text-left font-medium">Produit</th>
            <th className="p-3 text-left font-medium">Catégorie</th>
            <th className="p-3 text-left font-medium">Prix (FCFA)</th>
            <th className="p-3 text-left font-medium">Stock</th>
            <th className="p-3 text-left font-medium">Statut</th>
            <th className="p-3 text-left font-medium">Promotion</th>
            <th className="p-3 text-left font-medium">Actions</th>
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
              <td className="p-3">
                {product.isOnPromotion && product.promotionPrice ? (
                  <div>
                    <span className="line-through text-gray-500">{product.price.toLocaleString()}</span>
                    <br />
                    <span className="font-medium text-red-600">{product.promotionPrice.toLocaleString()}</span>
                  </div>
                ) : (
                  product.price.toLocaleString()
                )}
              </td>
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
              <td className="p-3">
                {product.isOnPromotion ? (
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-800">
                    En promotion
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                    Standard
                  </span>
                )}
              </td>
              <td className="p-3">
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onPromotion(product)}
                    className="text-orange-500 hover:text-orange-700"
                  >
                    <Tag className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(product)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
