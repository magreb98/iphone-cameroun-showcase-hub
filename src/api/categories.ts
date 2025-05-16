
import api from './index';

export interface Category {
  id: number;
  name: string;
  description: string;
  productCount?: number;
}

export interface CategoryFormData {
  name: string;
  description: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get('/categories');
  return response.data;
};

export const getCategory = async (id: number): Promise<Category> => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

export const createCategory = async (categoryData: CategoryFormData): Promise<Category> => {
  const response = await api.post('/categories', categoryData);
  return response.data;
};

export const updateCategory = async (id: number, categoryData: CategoryFormData): Promise<Category> => {
  const response = await api.put(`/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};
