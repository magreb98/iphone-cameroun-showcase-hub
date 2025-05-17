
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

export interface Product {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  category: string;
  inStock: boolean;
  quantity: number;
  isOnPromotion?: boolean;
  promotionPrice?: number;
  promotionEndDate?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const isPromotionValid = 
    product.isOnPromotion && 
    product.promotionPrice && 
    (!product.promotionEndDate || new Date(product.promotionEndDate) > new Date());

  const displayPrice = isPromotionValid ? product.promotionPrice : product.price;
  
  return (
    <Link to={`/products/${product.id}`}>
      <div className="product-card group">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          {!product.inStock && (
            <div className="absolute top-0 right-0 m-2">
              <Badge variant="destructive">Rupture de stock</Badge>
            </div>
          )}
          {isPromotionValid && (
            <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white py-1 px-2 flex items-center justify-center">
              <Tag className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Promotion</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-apple-dark truncate">{product.name}</h3>
          <div className="flex justify-between items-center mt-2">
            {isPromotionValid ? (
              <div className="flex flex-col">
                <p className="font-semibold text-apple-blue">
                  {displayPrice?.toLocaleString()} FCFA
                </p>
                <p className="text-xs text-gray-500 line-through">
                  {product.price.toLocaleString()} FCFA
                </p>
              </div>
            ) : (
              <p className="font-semibold text-apple-blue">
                {displayPrice.toLocaleString()} FCFA
              </p>
            )}
            {product.inStock ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                En stock
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Indisponible
              </Badge>
            )}
          </div>
          <p className="text-sm text-apple-accent mt-1">
            {product.category}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
