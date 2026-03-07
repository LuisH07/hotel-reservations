import api from './api'; // Ajuste para a sua instância do axios

export interface ComodidadeData {
  id?: number;
  nome: string;
}

export const getComodidades = async (): Promise<ComodidadeData[]> => {
  const response = await api.get<ComodidadeData[]>('/comodidades');
  return response.data;
};

export const createComodidade = async (data: { nome: string }): Promise<ComodidadeData> => {
  const response = await api.post<ComodidadeData>('/comodidades', data);
  return response.data;
};

export const updateComodidade = async (id: number, data: { nome: string }): Promise<ComodidadeData> => {
  const response = await api.put<ComodidadeData>(`/comodidades/${id}`, data);
  return response.data;
};

export const deleteComodidade = async (id: number): Promise<void> => {
  await api.delete(`/comodidades/${id}`);
};