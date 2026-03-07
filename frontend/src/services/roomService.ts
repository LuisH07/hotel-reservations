import api from './api';

export interface CategoriaResponse {
  id: number;
  nome: string;
  capacidade: number;
  precoDiaria: number;
  descricao?: string;
}

export interface ComodidadeResponse {
  id: number;
  nome: string;
}

export interface Room {
  id: number;
  numero: string;
  status: 'DISPONIVEL' | 'OCUPADO' | 'MANUTENCAO';
  area: number;
  hotelId: number;
  categoria: CategoriaResponse;
  comodidades: ComodidadeResponse[];
  image?: string;
}

export interface CreateRoomRequest {
  hotelId: number;
  categoriaId: number;
  numero: string;
  status?: string;
  area?: number;
  comodidadeIds: number[];
}

export const getRoomsByHotel = async (hotelId: number): Promise<Room[]> => {
  try {
    const response = await api.get<Room[]>(`/quartos/hotel/${hotelId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar quartos por hotel:', error);
    throw error;
  }
};

export const deleteRoomService = async (id: number): Promise<boolean> => {
  try {
    await api.delete(`/quartos/${id}`);
    return true;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.detail) {
      throw new Error(error.response.data.detail);
    }
    
    console.error('Erro ao deletar quarto:', error);
    throw new Error('Ocorreu um erro inesperado ao tentar deletar o quarto.');
  }
};

export const updateRoomService = async (id: number, data: CreateRoomRequest): Promise<boolean> => {
  try {
    await api.put(`/quartos/${id}`, data);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar quarto:', error);
    return false;
  }
};

export const createQuarto = async (data: CreateRoomRequest) => {
  const response = await api.post('/quartos', data);
  return response.data;
};