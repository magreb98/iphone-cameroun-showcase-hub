
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createProduct, updateProduct, uploadProductImages, ProductFormData } from "@/api/products";
import { Product } from "@/components/products/ProductCard";
import { ProductImage } from "@/components/admin/products/ProductImageManager";

export const useProductForm = (
  editingProduct: ProductFormData | null,
  onClose: () => void
) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: 0,
    categoryId: 0,
    locationId: 0,
    inStock: true,
    quantity: 0,
    imageUrl: ""
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  
  // Check if current user is a super admin (to show location selection)
  const currentUser = queryClient.getQueryData<any>(["currentUser"]);
  const isSuperAdmin = currentUser?.isSuperAdmin;

  useEffect(() => {
    if (editingProduct) {
      setFormData(editingProduct);

      // Get the existing images from the product
      if (editingProduct.id) {
        const product = queryClient.getQueryData<Product>(["product", editingProduct.id]);
        if (product?.images?.length) {
          setExistingImages(product.images);
        }
      }
    } else {
      setFormData({
        name: "",
        price: 0,
        categoryId: 0,
        locationId: currentUser?.locationId || 0,
        inStock: true,
        quantity: 0,
        imageUrl: ""
      });
      setExistingImages([]);
    }
    setSelectedFiles([]);
    setPreviewImages([]);
  }, [editingProduct, queryClient, currentUser?.locationId]);

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async (product) => {
      // Upload images if any are selected
      if (selectedFiles.length > 0) {
        try {
          await uploadProductImages(product.id, selectedFiles);
          toast.success("Images téléchargées avec succès");
        } catch (error) {
          toast.error("Erreur lors du téléchargement des images");
          console.error(error);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Produit ajouté avec succès");
      onClose();
    },
    onError: (error) => {
      toast.error("Erreur lors de l'ajout du produit");
      console.error(error.message);
    }
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductFormData }) => {
      // First update the product
      const updatedProduct = await updateProduct(id, data);
      
      // Then upload any new images if selected
      if (selectedFiles.length > 0) {
        await uploadProductImages(id, selectedFiles);
      }
      
      return updatedProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Produit mis à jour avec succès");
      onClose();
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour du produit");
      console.error(error);
    }
  });

  // Form field handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === "number" ? Number(value) : value
    });
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData({
      ...formData,
      [field]: field === "categoryId" || field === "locationId" ? Number(value) : value
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      inStock: checked
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For upload tab, if we don't have a URL but have files, set a placeholder URL
    const finalFormData = {...formData};
    
    if (editingProduct && editingProduct.id) {
      // Update existing product
      updateProductMutation.mutate({
        id: editingProduct.id,
        data: finalFormData
      });
    } else {
      // Add new product
      createProductMutation.mutate(finalFormData);
    }
  };

  return {
    formData,
    setFormData,
    isSuperAdmin,
    selectedFiles,
    setSelectedFiles,
    previewImages,
    setPreviewImages,
    existingImages, 
    setExistingImages,
    handleChange,
    handleSelectChange,
    handleSwitchChange,
    handleSubmit,
    isSubmitting: createProductMutation.isPending || updateProductMutation.isPending
  };
};
