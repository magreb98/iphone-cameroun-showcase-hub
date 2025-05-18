
import api from './index';

export interface Configuration {
  id: number;
  configKey: string;
  configValue: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const getConfigurations = async (): Promise<Configuration[]> => {
  const response = await api.get('/configurations');
  return response.data;
};

export const getConfiguration = async (key: string): Promise<Configuration> => {
  const response = await api.get(`/configurations/${key}`);
  return response.data;
};

export const saveConfiguration = async (configData: {
  configKey: string;
  configValue: string;
  description?: string;
}): Promise<Configuration> => {
  const response = await api.post('/configurations', configData);
  return response.data;
};

export const deleteConfiguration = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/configurations/${id}`);
  return response.data;
};
