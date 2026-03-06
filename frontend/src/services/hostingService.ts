import api from './api';

// Ajuste conforme o ID do seu hotel (pode vir de um contexto ou config)
const HOTEL_ID = 1; 

export interface QuartoDisponivel {
    id: number;
    numero: string;
    tipo: string;
}

export interface ClientePorCpf {
    id: number;
    nome: string;
    cpf: string;
    email: string;
}

export interface CriarHospedagemRequest {
    reservaId: number | null;
    quartoId: number;
    clienteCpf: string;
    dataEntrada: string;
    dataSaida: string;
    pagamento: {
        metodoPagamento: string;
        status: string;
        valorTotal: number;
        dataPagamento: string;
    };
}

/**
 * Busca quartos disponíveis filtrados por período e hotel
 */
export const getQuartosDisponiveis = async (start: string, end: string): Promise<QuartoDisponivel[]> => {
    const response = await api.get<QuartoDisponivel[]>(
        `/quartos/disponiveis?start=${start}&end=${end}&hotelId=${HOTEL_ID}`
    );
    console.log(response)
    return response.data;
};

/**
 * Busca cliente pelo CPF
 */
export const getClienteByCpf = async (cpf: string): Promise<ClientePorCpf> => {
    const response = await api.get<ClientePorCpf>(`/clientes/cpf/${cpf}`);
    return response.data;
};

/**
 * Cria a hospedagem
 */
export const createHospedagem = async (data: CriarHospedagemRequest): Promise<any> => {
    const response = await api.post('/hospedagens', data);
    return response.data;
};