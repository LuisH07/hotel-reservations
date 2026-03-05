import { type ReservationCardProps } from '../components/reservations/ReservationCard';
import api from './api';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Mock Data - Mantendo em memória para persistir alterações durante a sessão
let MOCK_RESERVATIONS: ReservationCardProps[] = [
    {
        id: "000001",
        status: "Concluída",
        clientName: "Gael Aparecida",
        clientEmail: "qmoraes@example.org",
        clientCpf: "036.241.978-78",
        clientPhone: "+55043963817115",
        roomNumber: "101",
        roomCategory: "Luxo",
        roomCapacity: 4,
        pricePerNight: 450.0,
        totalValue: 2650.0,
        stayDuration: "5 Noites",
        startDate: "10/01/2026",
        endDate: "15/01/2026"
    },
    {
        id: "000002",
        status: "Concluída",
        clientName: "Sr. Lucca Peixoto",
        clientEmail: "ana-ceciliaribeiro@example.com",
        clientCpf: "317.249.680-50",
        clientPhone: "+5590922866300",
        roomNumber: "102",
        roomCategory: "Standard",
        roomCapacity: 2,
        pricePerNight: 150.0,
        totalValue: 1065.0,
        stayDuration: "6 Noites",
        startDate: "12/01/2026",
        endDate: "18/01/2026"
    },
    {
        id: "000003",
        status: "Concluída",
        clientName: "Bruno Aragão",
        clientEmail: "pda-luz@example.net",
        clientCpf: "168.537.942-73",
        clientPhone: "+5546972993161",
        roomNumber: "103",
        roomCategory: "Presidencial",
        roomCapacity: 5,
        pricePerNight: 1200.0,
        totalValue: 6160.0,
        stayDuration: "5 Noites",
        startDate: "20/01/2026",
        endDate: "25/01/2026"
    },
    {
        id: "000004",
        status: "Cancelada",
        clientName: "Erick Montenegro",
        clientEmail: "avieira@example.org",
        clientCpf: "518.340.962-51",
        clientPhone: "+5547920250675",
        roomNumber: "104",
        roomCategory: "Standard",
        roomCapacity: 2,
        pricePerNight: 150.0,
        totalValue: 470.0,
        stayDuration: "2 Noites",
        startDate: "15/01/2026",
        endDate: "17/01/2026"
    },
    {
        id: "000005",
        status: "Concluída",
        clientName: "Francisco Silva",
        clientEmail: "sousamaria-helena@example.net",
        clientCpf: "248.109.576-67",
        clientPhone: "+5543950199988",
        roomNumber: "105",
        roomCategory: "Standard",
        roomCapacity: 2,
        pricePerNight: 150.0,
        totalValue: 1650.0,
        stayDuration: "9 Noites",
        startDate: "01/02/2026",
        endDate: "10/02/2026"
    },
    {
        id: "000006",
        status: "Concluída",
        clientName: "Bruno Ferreira",
        clientEmail: "qcavalcanti@example.com",
        clientCpf: "645.370.829-92",
        clientPhone: "+5580999297947",
        roomNumber: "106",
        roomCategory: "Standard",
        roomCapacity: 2,
        pricePerNight: 150.0,
        totalValue: 630.0,
        stayDuration: "3 Noites",
        startDate: "05/02/2026",
        endDate: "08/02/2026"
    },
    {
        id: "000007",
        status: "Cancelada",
        clientName: "Ana Beatriz Teixeira",
        clientEmail: "leandro04@example.org",
        clientCpf: "578.910.264-67",
        clientPhone: "+5593943439548",
        roomNumber: "107",
        roomCategory: "Luxo",
        roomCapacity: 4,
        pricePerNight: 450.0,
        totalValue: 2370.0,
        stayDuration: "5 Noites",
        startDate: "10/02/2026",
        endDate: "15/02/2026"
    },
    {
        id: "000008",
        status: "Concluída",
        clientName: "Sra. Laura Albuquerque",
        clientEmail: "lucas-gabriel93@example.org",
        clientCpf: "132.590.687-59",
        clientPhone: "+55023967939940",
        roomNumber: "108",
        roomCategory: "Presidencial",
        roomCapacity: 5,
        pricePerNight: 1200.0,
        totalValue: 6460.0,
        stayDuration: "5 Noites",
        startDate: "20/02/2026",
        endDate: "25/02/2026"
    }
];

export const getDetailedReservations = async (email?: string): Promise<ReservationCardProps[]> => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Buscando reservas detalhadas (MOCK). Email:', email);
        if (email) {
          const filtered = MOCK_RESERVATIONS.filter(res => res.clientEmail.includes(email));
          resolve([...filtered]);
        } else {
          resolve([...MOCK_RESERVATIONS]);
        }
      }, 1000);
    });
  }

  try {
    const url = email ? `/reservas/detalhadas?email=${email}` : '/reservas/detalhadas';
    const response = await api.get<ReservationCardProps[]>(url);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar reservas detalhadas:', error);
    throw error;
  }
};

export const getReservationsByEmail = async (email?: string): Promise<ReservationCardProps[]> => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Buscando reservas (MOCK). Email:', email);
        if (email) {
          const filtered = MOCK_RESERVATIONS.filter(res => res.clientEmail === email);
          resolve([...filtered]);
        } else {
          // Se não passar email, retorna todas (comportamento para gerente)
          resolve([...MOCK_RESERVATIONS]);
        }
      }, 1000);
    });
  }

  try {
    const url = email ? `/reservas/detalhadas?email=${email}` : '/reservas/detalhadas';
    const response = await api.get<ReservationCardProps[]>(url);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    throw error;
  }
};

export const cancelReservationService = async (id: string): Promise<boolean> => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Atualiza o status na "base de dados" mockada
        MOCK_RESERVATIONS = MOCK_RESERVATIONS.map(res => 
          res.id === id ? { ...res, status: 'Cancelada' as const } : res
        );
        resolve(true);
      }, 500);
    });
  }

  // Se não estiver usando Mock, envia comando de exclusão para o backend
  try {
    // Chama a API com o verbo DELETE passando o ID
    await api.delete(`/reservas/${id}`);
    return true; // Retorna true se sucesso (200/204)
  } catch (error) {
    // Em caso de falha na API
    console.error('Erro ao cancelar reserva:', error);
    return false;
  }
};
