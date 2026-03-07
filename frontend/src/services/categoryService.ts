import api from './api'; 
export interface CategoriaData {
  id?: number;
  nome: string;
  precoDiaria: number;
  capacidade: number;
}

export const getCategories = async (): Promise<CategoriaData[]> => {
  const response = await api.get<CategoriaData[]>('/categorias');
  return response.data;
};

export const createCategory = async (data: CategoriaData): Promise<CategoriaData> => {
  const response = await api.post<CategoriaData>('/categorias', data);
  return response.data;
};

export const updateCategory = async (id: number, data: CategoriaData): Promise<CategoriaData> => {
  const response = await api.put<CategoriaData>(`/categorias/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`/categorias/${id}`);
};