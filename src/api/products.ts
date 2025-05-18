
import api from './index';
import { Product } from '@/components/products/ProductCard';

export interface ProductFormData {
  id?: number;
  name: string;
  price: number;
  imageUrl: string;
  categoryId: number;
  inStock: boolean;
  quantity: number;
  isOnPromotion?: boolean;
  promotionPrice?: number;
  promotionEndDate?: string;
}

export interface ProductResponseWithCategory {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  categoryId: number;
  inStock: boolean;
  quantity: number;
  isOnPromotion: boolean;
  promotionPrice: number | null;
  promotionEndDate: string | null;
  Category: {
    name: string;
  };
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasMore: boolean;
}

export interface ProductsResponse {
  products: ProductResponseWithCategory[];
  pagination: PaginationData;
}

export const getProducts = async (page = 1, limit = 12, categoryId?: number): Promise<{products: Product[], pagination: PaginationData}> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  if (categoryId) {
    params.append('category', categoryId.toString());
  }
  
  const response = await api.get(`/products?${params.toString()}`);
  
  // Transform API response to match our Product interface
  const products: Product[] = response.data.products.map((product: ProductResponseWithCategory) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl,
    category: product.Category.name,
    inStock: product.inStock,
    quantity: product.quantity,
    isOnPromotion: product.isOnPromotion,
    promotionPrice: product.promotionPrice,
    promotionEndDate: product.promotionEndDate
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
    inStock: response.data.inStock,
    quantity: response.data.quantity,
    isOnPromotion: response.data.isOnPromotion,
    promotionPrice: response.data.promotionPrice,
    promotionEndDate: response.data.promotionEndDate
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
