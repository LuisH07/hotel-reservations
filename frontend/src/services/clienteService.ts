import api from './api';

export interface ClienteProfile {
    id: number;
    userId: number;
    nome: string;
    cpf: string;
    telefone: string;
    dataNascimento: string;
    email: string;
}

export const getMyProfile = async (): Promise<ClienteProfile> => {
    const response = await api.get<ClienteProfile>('/clientes/me');
    return response.data;
};

export interface ClienteUpdateRequest {
    nome: string;
    telefone: string;
    dataNascimento: string; // YYYY-MM-DD
    cpf: string;
    email: string;
}

export const updateMyProfile = async (data: ClienteUpdateRequest): Promise<ClienteProfile> => {
    const response = await api.put<ClienteProfile>('/clientes/me', data);
    return response.data;
};
