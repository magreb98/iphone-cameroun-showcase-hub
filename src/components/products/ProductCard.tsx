
import { Link } from "react-router-dom";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

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
  location?: string;
  locationId?: number;
  locationWhatsapp?: string;
  inStock: boolean;
  quantity: number;
  isOnPromotion?: boolean;
  promotionPrice?: number | null;
  promotionEndDate?: string | null;
  images?: ProductImage[];
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  // Calculer si la promotion est active
  const isPromotionActive = product.isOnPromotion && 
    product.promotionPrice && 
    (!product.promotionEndDate || new Date(product.promotionEndDate) > new Date());
  
  // Calcul de la réduction en pourcentage
  const discountPercentage = isPromotionActive && product.promotionPrice 
    ? Math.round((1 - product.promotionPrice / product.price) * 100) 
    : 0;

  return (
    <Link to={`/products/${product.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow product-card max-w-xs">
        <div className="relative pt-[80%] bg-white overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {isPromotionActive && (
              <Badge className="bg-red-500 text-white text-xs">-{discountPercentage}%</Badge>
            )}
            
            {!product.inStock && (
              <Badge variant="outline" className="bg-gray-700 text-white border-0 text-xs">
                Rupture de stock
              </Badge>
            )}
          </div>
          
          {product.location && (
            <Badge className="absolute top-2 right-2 bg-blue-500 text-white text-xs">
              {product.location}
            </Badge>
          )}
        </div>

        <CardContent className="pt-3 px-3 pb-1">
          <div className="text-xs text-gray-500">{product.category}</div>
          <h3 className="font-medium text-sm line-clamp-2 my-1">{product.name}</h3>
          
          {isPromotionActive ? (
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-semibold text-red-500 text-sm">{formatPrice(product.promotionPrice!)}</span>
              <span className="text-gray-500 text-xs line-through">{formatPrice(product.price)}</span>
            </div>
          ) : (
            <div className="mt-1 font-semibold text-sm">{formatPrice(product.price)}</div>
          )}
        </CardContent>
        
        <CardFooter className="px-3 py-2 border-t">
          <div className="text-xs text-apple-blue w-full text-center font-medium">
            Voir le détail
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProductCard;
