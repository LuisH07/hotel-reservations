import api from './api';

// Ajuste conforme o ID do seu hotel (pode vir de um contexto ou config)
const HOTEL_ID = 1; 

export interface QuartoDisponivel {
    id: number;
    numero: string;
    tipo: string;
    preco: number;
}

export interface ClientePorCpf {
    id: number;
    nome: string;
    cpf: string;
    email: string;
}

export interface ServicoAdicional {
    id: number;
    nomeServico: string;
    descricao?: string;
    preco: number;
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
    servicosAdicionaisIds: number[];
    
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
 * Busca todos os serviços adicionais disponíveis
 */
export const getServicosAdicionais = async (): Promise<ServicoAdicional[]> => {
    const response = await api.get<ServicoAdicional[]>('/servicos-adicionais');
    return response.data;
};

/**
 * Cria a hospedagem
 */
export const createHospedagem = async (data: CriarHospedagemRequest): Promise<any> => {
    console.log(data)
    const response = await api.post('/hospedagens', data);
    return response.data;
};