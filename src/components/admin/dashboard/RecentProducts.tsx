
import { Product } from "@/components/products/ProductCard";

interface RecentProductsProps {
  products: Product[];
  isSuperAdmin: boolean;
  selectedLocation: number | null;
  locationName: string;
}

const RecentProducts = ({ products, isSuperAdmin, selectedLocation, locationName }: RecentProductsProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Produits récents {selectedLocation ? `de ${locationName}` : ''}</h2>
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left font-medium">Produit</th>
              <th className="p-3 text-left font-medium">Catégorie</th>
              <th className="p-3 text-left font-medium">Prix (FCFA)</th>
              <th className="p-3 text-left font-medium">Stock</th>
              <th className="p-3 text-left font-medium">Statut</th>
              {isSuperAdmin && <th className="p-3 text-left font-medium">Magasin</th>}
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
                {isSuperAdmin && (
                  <td className="p-3">{product.location}</td>
                )}
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={isSuperAdmin ? 6 : 5} className="p-4 text-center text-gray-500">
                  Aucun produit trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentProducts;
