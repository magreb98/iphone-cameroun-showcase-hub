
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { togglePromotion } from "@/api/products";
import { Product } from "@/components/products/ProductCard";

interface PromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

const PromotionDialog = ({ open, onOpenChange, product }: PromotionDialogProps) => {
  const queryClient = useQueryClient();
  const [promotionData, setPromotionData] = useState({
    isOnPromotion: false,
    promotionPrice: 0,
    promotionEndDate: ""
  });

  useEffect(() => {
    if (product) {
      setPromotionData({
        isOnPromotion: product.isOnPromotion || false,
        promotionPrice: product.promotionPrice || Math.round(product.price * 0.9), // Default 10% off
        promotionEndDate: product.promotionEndDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default 7 days
      });
    }
  }, [product]);

  const togglePromotionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof promotionData }) => 
      togglePromotion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Promotion mise à jour avec succès");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour de la promotion");
      console.error(error);
    }
  });

  const handleCloseDialog = () => {
    onOpenChange(false);
  };

  const handlePromotionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setPromotionData({
      ...promotionData,
      [name]: type === "number" ? Number(value) : value
    });
  };

  const handlePromotionSwitchChange = (checked: boolean) => {
    setPromotionData({
      ...promotionData,
      isOnPromotion: checked
    });
  };

  const handlePromotionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (product && product.id) {
      togglePromotionMutation.mutate({
        id: product.id,
        data: promotionData
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Gérer la promotion
          </DialogTitle>
          <DialogDescription>
            {product?.name}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handlePromotionSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isOnPromotion" className="text-right">
                Activer la promotion
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="isOnPromotion"
                  checked={promotionData.isOnPromotion}
                  onCheckedChange={handlePromotionSwitchChange}
                />
                <Label htmlFor="isOnPromotion">
                  {promotionData.isOnPromotion ? "Promotion active" : "Pas de promotion"}
                </Label>
              </div>
            </div>

            {promotionData.isOnPromotion && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="promotionPrice" className="text-right">
                    Prix promotionnel
                  </Label>
                  <Input
                    id="promotionPrice"
                    name="promotionPrice"
                    type="number"
                    value={promotionData.promotionPrice}
                    onChange={handlePromotionChange}
                    className="col-span-3"
                    required={promotionData.isOnPromotion}
                    min="0"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="promotionEndDate" className="text-right">
                    Date de fin
                  </Label>
                  <Input
                    id="promotionEndDate"
                    name="promotionEndDate"
                    type="date"
                    value={promotionData.promotionEndDate}
                    onChange={handlePromotionChange}
                    className="col-span-3"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {product && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="text-right text-sm text-gray-500">
                      Économie:
                    </div>
                    <div className="col-span-3">
                      <span className="text-red-600 font-medium">
                        {product.price - promotionData.promotionPrice} FCFA
                        ({Math.round(((product.price - promotionData.promotionPrice) / product.price) * 100)}%)
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseDialog}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={togglePromotionMutation.isPending}
              className={promotionData.isOnPromotion ? "bg-orange-600 hover:bg-orange-700" : undefined}
            >
              {togglePromotionMutation.isPending ? "Traitement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PromotionDialog;
