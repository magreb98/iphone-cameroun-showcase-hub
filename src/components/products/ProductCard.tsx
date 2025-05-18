
import { Link } from "react-router-dom";
import { Tag } from "lucide-react";

export interface ProductImage {
  id: number;
  url: string;
  isMain: boolean;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  inStock: boolean;
  quantity?: number;
  isOnPromotion?: boolean;
  promotionPrice?: number | null;
  promotionEndDate?: string | null;
  images?: ProductImage[];
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const isPromotionValid = 
    product.isOnPromotion && 
    product.promotionPrice && 
    (!product.promotionEndDate || new Date(product.promotionEndDate) > new Date());
  
  const displayPrice = isPromotionValid ? product.promotionPrice : product.price;
  
  // Use the first image from the images array if available, otherwise use the default imageUrl
  const mainImage = product.images?.find(img => img.isMain)?.url || product.imageUrl;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
    >
      <div className="aspect-square w-full relative overflow-hidden bg-gray-100">
        <img
          src={mainImage}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        
        {isPromotionValid && (
          <div className="absolute top-0 left-0 bg-red-600 text-white py-1 px-3 flex items-center">
            <Tag className="w-4 h-4 mr-2" />
            <span className="font-medium">
              -{Math.round(((product.price - (product.promotionPrice || 0)) / product.price) * 100)}%
            </span>
          </div>
        )}
        
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white px-3 py-1 text-sm font-medium text-gray-900 rounded">
              Indisponible
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-medium mb-1 line-clamp-2">{product.name}</h3>
        <div className="flex items-baseline gap-2 mb-1">
          {isPromotionValid ? (
            <>
              <span className="text-red-600 font-bold">
                {displayPrice?.toLocaleString()} FCFA
              </span>
              <span className="text-sm text-gray-500 line-through">
                {product.price.toLocaleString()} FCFA
              </span>
            </>
          ) : (
            <span className="text-apple-blue font-bold">
              {displayPrice?.toLocaleString()} FCFA
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500">{product.category}</div>
        
        {product.images && product.images.length > 1 && (
          <div className="mt-2 flex justify-end">
            <span className="text-xs text-gray-500">{product.images.length} images</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
