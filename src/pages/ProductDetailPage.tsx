
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";
import { toast } from "sonner";
import { getProduct } from "@/api/products";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(Number(id)),
    enabled: !!id
  });
  
  const isPromotionValid = 
    product?.isOnPromotion && 
    product?.promotionPrice && 
    (!product?.promotionEndDate || new Date(product.promotionEndDate) > new Date());
  
  const displayPrice = isPromotionValid ? product?.promotionPrice : product?.price;
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Chargement du produit...</h1>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Produit non trouvé</h1>
            <p>Le produit que vous recherchez n'existe pas ou a été supprimé.</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // Images fictives supplémentaires pour la démo
  const images = [
    product.imageUrl,
    "https://images.unsplash.com/photo-1565775177580-5e413706c7e5?auto=format&fit=crop&w=500",
    "https://images.unsplash.com/photo-1512054502232-10a0a035d672?auto=format&fit=crop&w=500",
  ];

  const handleContactClick = () => {
    toast.success("Notre équipe vous contactera bientôt !");
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 relative">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
              {isPromotionValid && (
                <div className="absolute top-0 left-0 bg-red-600 text-white py-1 px-3 flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  <span className="font-medium">
                    -{Math.round(((product.price - (product.promotionPrice || 0)) / product.price) * 100)}%
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative flex-shrink-0 aspect-square w-20 overflow-hidden rounded-md border-2 ${
                    selectedImage === index ? "border-apple-blue" : "border-gray-200"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} preview ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-apple-dark">{product.name}</h1>
              <div className="flex items-center space-x-3">
                {isPromotionValid ? (
                  <>
                    <p className="text-xl font-semibold text-red-600">
                      {displayPrice?.toLocaleString()} FCFA
                    </p>
                    <p className="text-gray-500 line-through">
                      {product.price.toLocaleString()} FCFA
                    </p>
                  </>
                ) : (
                  <p className="text-xl font-semibold text-apple-blue">
                    {displayPrice?.toLocaleString()} FCFA
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {product.inStock ? (
                <Badge className="bg-green-100 text-green-800 border-transparent">
                  En stock
                </Badge>
              ) : (
                <Badge variant="destructive">
                  Indisponible
                </Badge>
              )}
              
              {product.quantity !== undefined && product.quantity > 0 && (
                <span className="text-sm text-gray-500">
                  {product.quantity} {product.quantity > 1 ? "unités disponibles" : "unité disponible"}
                </span>
              )}
            </div>
            
            {isPromotionValid && product.promotionEndDate && (
              <div className="bg-orange-50 border border-orange-200 rounded p-3 flex items-center space-x-2">
                <Tag className="w-4 h-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-800">Offre spéciale</p>
                  <p className="text-xs text-orange-600">
                    Promotion valable jusqu'au {new Date(product.promotionEndDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
            
            <div className="space-y-4 border-t border-b py-4">
              <h3 className="font-semibold text-lg">Description</h3>
              <p className="text-gray-600">
                {product.category === "iPhone" && "L'iPhone offre une expérience utilisateur fluide avec un écran haute résolution, un appareil photo avancé et les dernières fonctionnalités iOS. Ce modèle est idéal pour la photographie, les jeux et l'utilisation quotidienne."}
                {product.category === "MacBook" && "Le MacBook est un ordinateur portable performant et élégant avec un écran Retina, un clavier confortable et une excellente autonomie de batterie. Parfait pour les professionnels et les étudiants."}
                {product.category === "iPad" && "L'iPad combine puissance et portabilité avec son écran tactile réactif et ses performances élevées. Idéal pour la créativité, le divertissement et la productivité en déplacement."}
                {product.category === "Accessory" && "Accessoire Apple de haute qualité conçu pour compléter votre expérience avec vos appareils. Design élégant et fonctionnalité optimale garantis."}
              </p>
            </div>
            
            <div className="flex space-x-4">
              <Button
                className="w-full"
                disabled={!product.inStock}
                onClick={handleContactClick}
              >
                {product.inStock ? "Contactez-nous" : "Indisponible"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => toast.info("Cette fonctionnalité sera bientôt disponible.")}
              >
                En savoir plus
              </Button>
            </div>
            
            {/* Specifications */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Spécifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2">
                <div className="text-sm">
                  <span className="text-gray-500">Catégorie:</span>{" "}
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Marque:</span>{" "}
                  <span className="font-medium">Apple</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Garantie:</span>{" "}
                  <span className="font-medium">12 mois</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">État:</span>{" "}
                  <span className="font-medium">Neuf</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDetailPage;
