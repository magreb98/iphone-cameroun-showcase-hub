
import api from './index';

export interface Location {
  id: number;
  name: string;
  address?: string;
  description?: string;
  imageUrl?: string;
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocationFormData {
  id?: number;
  name: string;
  address?: string;
  description?: string;
  imageUrl?: string;
  phone?: string;
  email?: string;
}

export const getLocations = async (): Promise<Location[]> => {
  const response = await api.get('/locations');
  return response.data;
};

export const getLocation = async (id: number): Promise<Location> => {
  const response = await api.get(`/locations/${id}`);
  return response.data;
};

export const createLocation = async (locationData: LocationFormData): Promise<Location> => {
  const response = await api.post('/locations', locationData);
  return response.data;
};

export const updateLocation = async (id: number, locationData: LocationFormData): Promise<Location> => {
  const response = await api.put(`/locations/${id}`, locationData);
  return response.data;
};

export const deleteLocation = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/locations/${id}`);
  return response.data;
};
