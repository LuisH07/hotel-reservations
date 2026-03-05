import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import styles from './MinhasReservasPage.module.css';
import ReservationCard, { type ReservationCardProps } from '../components/reservations/ReservationCard';
import { getReservationsByEmail, cancelReservationService, getDetailedReservations, deleteReservationService } from '../services/reservationService';
import { getUserRole, getUserEmail } from '../services/authService';

export default function MinhasReservasPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState<ReservationCardProps[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');
  
  const userRole = getUserRole();
  const userEmail = getUserEmail();
  const isManager = userRole === 'FUNCIONARIO';

  // Efeito para carregar reservas automaticamente ao montar a página
  useEffect(() => {
    const loadInitialReservations = async () => {
      setLoading(true);
      setError('');
      try {
        if (isManager) {
          // Gerente: carrega todas as reservas detalhadas inicialmente
          const results = await getDetailedReservations(); 
          setReservations(results);
          setHasSearched(true);
        } else if (userEmail) {
          // Cliente: carrega apenas suas reservas
          const results = await getReservationsByEmail(userEmail);
          setReservations(results);
          setHasSearched(true);
        }
      } catch (err) {
        console.error('Erro ao carregar reservas:', err);
        setError('Não foi possível carregar as reservas.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialReservations();
  }, [isManager, userEmail]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !isManager) return; // Cliente precisa ter email (mas aqui o form nem deve aparecer)
    
    setLoading(true);
    setHasSearched(false);
    setError('');
    setReservations([]);
    
    try {
      // Se for gerente e o campo de busca estiver vazio, busca todas novamente
      // Se tiver email preenchido, busca específicas
      const searchEmail = email || undefined;
      
      let results;
      if (isManager) {
        results = await getDetailedReservations(searchEmail);
      } else {
        // Cliente buscando (embora a UI não mostre busca para cliente)
        results = await getReservationsByEmail(searchEmail);
      }
      
      setReservations(results);
      setHasSearched(true);
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
      setError('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  const handleEdit = (id: string) => {
    const reservation = reservations.find(r => r.id === id);
    if (reservation) {
      navigate(`/reserva/editar/${id}`, { state: reservation });
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm(`Tem certeza que deseja cancelar a reserva ${id}?`)) {
      try {
        const success = await cancelReservationService(id);
        if (success) {
          setReservations(prev => prev.map(res => 
            res.id === id ? { ...res, status: 'Cancelada' as const } : res
          ));
        } else {
          alert('Não foi possível cancelar a reserva. Tente novamente.');
        }
      } catch (error) {
        console.error('Erro ao cancelar reserva:', error);
        alert('Erro ao processar o cancelamento.');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Tem certeza que deseja apagar a reserva ${id}? Esta ação não pode ser desfeita.`)) {
      try {
        const success = await deleteReservationService(id);
        if (success) {
          setReservations(prev => prev.filter(res => res.id !== id));
        } else {
          alert('Não foi possível apagar a reserva. Tente novamente.');
        }
      } catch (error) {
        console.error('Erro ao apagar reserva:', error);
        alert('Erro ao processar a exclusão.');
      }
    }
  };

  const filteredReservations = reservations.filter(res => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'ACTIVE') return ['Ativa', 'PENDENTE', 'CONFIRMADA'].includes(res.status);
    if (filterStatus === 'COMPLETED') return ['Concluída', 'CONCLUIDA'].includes(res.status);
    if (filterStatus === 'CANCELLED') return ['Cancelada', 'CANCELADA'].includes(res.status);
    return true;
  });

  return (
    <div className={styles.container}>
      
      <div className={styles.searchContainer}>
        <h1 className={styles.title}>
          {isManager ? 'Gerenciar Reservas' : 'Minhas Reservas'}
        </h1>

        {/* Formulário de busca visível APENAS para Gerentes */}
        {isManager && (
          <form onSubmit={handleSearch} className={styles.form}>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                placeholder="Buscar por e-mail (deixe vazio para ver todas)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
              />
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className={styles.button}
              title="Buscar"
            >
              <Search size={24} />
            </button>
          </form>
        )}

        {/* Filtro de Status - Botões */}
        <div className={styles.filterContainer}>
          {[
            { label: 'Todas', value: 'ALL' },
            { label: 'Ativas', value: 'ACTIVE' },
            { label: 'Concluídas', value: 'COMPLETED' },
            { label: 'Canceladas', value: 'CANCELLED' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFilterStatus(option.value as any)}
              className={`${styles.filterButton} ${filterStatus === option.value ? styles.filterButtonActive : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {error && (
          <p className={styles.errorMessage} style={{ color: '#ef4444' }}>
            {error}
          </p>
        )}
      </div>

      {/* Seção de Resultados */}
      {filteredReservations.length > 0 && (
        <div className={styles.resultsContainer}>
          {filteredReservations.map(res => (
            <ReservationCard 
              key={res.id}
              {...res}
              onCancel={handleCancel}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {hasSearched && !loading && !error && (
         reservations.length === 0 ? (
            <p className={styles.errorMessage}>Nenhuma reserva encontrada.</p>
         ) : filteredReservations.length === 0 ? (
            <p className={styles.errorMessage}>Nenhuma reserva encontrada com o filtro selecionado.</p>
         ) : null
      )}
    </div>
  );
}
