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
}

export interface ProductResponseWithCategory {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  categoryId: number;
  inStock: boolean;
  quantity: number;
  Category: {
    name: string;
  };
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products');
  
  // Transform API response to match our Product interface
  const products: Product[] = response.data.map((product: ProductResponseWithCategory) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl,
    category: product.Category.name,
    inStock: product.inStock,
    quantity: product.quantity
  }));
  
  return products;
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
    quantity: response.data.quantity
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

export const deleteProduct = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};
