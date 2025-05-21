import api from './index';
import { Product } from '@/components/products/ProductCard';

export interface ProductFormData {
  id?: number;
  name: string;
  price: number;
  imageUrl: string;
  categoryId: number;
  locationId: number;
  inStock: boolean;
  quantity: number;
  isOnPromotion?: boolean;
  promotionPrice?: number;
  promotionEndDate?: string;
}

export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  isMainImage: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponseWithCategory {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  categoryId: number;
  locationId: number;
  inStock: boolean;
  quantity: number;
  isOnPromotion: boolean;
  promotionPrice: number | null;
  promotionEndDate: string | null;
  Category: {
    name: string;
  };
  Location: {
    name: string;
  };
  ProductImages: ProductImage[];
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasMore: boolean;
}

export interface ProductsResponse {
  products: Product[];
  pagination: PaginationData;
}

export const getProducts = async (page = 1, limit = 12, categoryId?: number, locationId?: number): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  if (categoryId) {
    params.append('category', categoryId.toString());
  }
  
  if (locationId) {
    params.append('location', locationId.toString());
  }
  
  const response = await api.get(`/products?${params.toString()}`);
  
  // Transform API response to match our Product interface
  const products: Product[] = response.data.products.map((product: ProductResponseWithCategory) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl,
    category: product.Category.name,
    location: product.Location ? product.Location.name : '',
    locationId: product.locationId,
    inStock: product.inStock,
    quantity: product.quantity,
    isOnPromotion: product.isOnPromotion,
    promotionPrice: product.promotionPrice,
    promotionEndDate: product.promotionEndDate,
    images: product.ProductImages ? product.ProductImages.map(img => ({
      id: img.id,
      url: img.imageUrl,
      isMain: img.isMainImage
    })) : []
  }));
  
  return {
    products,
    pagination: response.data.pagination
  };
};

export const getProduct = async (id: number): Promise<Product> => {
  const response = await api.get(`/products/${id}`);
  
  // Transform API response to match our Product interface
  const product: Product = {
    id: response.data.id,
    name: response.data.name,
    price: response.data.price,
    imageUrl: response.data.imageUrl,
    category: response.data.Category.name,
    location: response.data.Location ? response.data.Location.name : '',
    locationId: response.data.locationId,
    inStock: response.data.inStock,
    quantity: response.data.quantity,
    isOnPromotion: response.data.isOnPromotion,
    promotionPrice: response.data.promotionPrice,
    promotionEndDate: response.data.promotionEndDate,
    images: response.data.ProductImages ? response.data.ProductImages.map(img => ({
      id: img.id,
      url: img.imageUrl,
      isMain: img.isMainImage
    })) : []
  };
  
  return product;
};

export const createProduct = async (productData: ProductFormData): Promise<ProductResponseWithCategory> => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id: number, productData: ProductFormData): Promise<ProductResponseWithCategory> => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const uploadProductImages = async (id: number, images: File[]): Promise<{images: ProductImage[]}> => {
  const formData = new FormData();
  
  for (const image of images) {
    formData.append('images', image);
  }
  
  const response = await api.post(`/products/${id}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

export const setMainImage = async (productId: number, imageId: number): Promise<{message: string, image: ProductImage}> => {
  const response = await api.patch(`/products/${productId}/images/${imageId}/main`);
  return response.data;
};

export const deleteProductImage = async (productId: number, imageId: number): Promise<{message: string}> => {
  const response = await api.delete(`/products/${productId}/images/${imageId}`);
  return response.data;
};

export const togglePromotion = async (id: number, promotionData: {
  isOnPromotion: boolean;
  promotionPrice?: number;
  promotionEndDate?: string;
}): Promise<ProductResponseWithCategory> => {
  const response = await api.patch(`/products/${id}/toggle-promotion`, promotionData);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const getUserProducts = async (page = 1, limit = 10): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  const response = await api.get(`/products/user?${params.toString()}`);
  
  // Transform API response to match our Product interface
  const products: Product[] = response.data.products.map((product: ProductResponseWithCategory) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl,
    category: product.Category.name,
    location: product.Location ? product.Location.name : '',
    locationId: product.locationId,
    inStock: product.inStock,
    quantity: product.quantity,
    isOnPromotion: product.isOnPromotion,
    promotionPrice: product.promotionPrice,
    promotionEndDate: product.promotionEndDate,
    images: product.ProductImages ? product.ProductImages.map(img => ({
      id: img.id,
      url: img.imageUrl,
      isMain: img.isMainImage
    })) : []
  }));
  
  return {
    products,
    pagination: response.data.pagination
  };
};
