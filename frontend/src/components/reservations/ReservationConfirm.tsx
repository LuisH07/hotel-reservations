import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import styles from './ReservationConfirm.module.css';
import { ChevronLeft, CheckCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

import type { AdditionalServiceData } from './AdditionalModal';
import { getServicosAdicionais } from '../../services/hostingService'; // <-- Importado aqui

const ReservationConfirm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Estados dos Serviços ---
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  
  // 1. Iniciando vazio
  const [servicosDisponiveis, setServicosDisponiveis] = useState<AdditionalServiceData[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);

  const { room, checkIn, checkOut } = location.state || {};

  // 2. Carregando os serviços da API ao montar a tela
  useEffect(() => {
    const carregarServicos = async () => {
      try {
        const dados = await getServicosAdicionais();
        
        // Mapeando para garantir que o formato bate com o AdditionalServiceData
        const servicosFormatados: AdditionalServiceData[] = dados.map((servico: any) => ({
          id: servico.id,
          nomeServico: servico.nomeServico,
          descricao: servico.descricao || '',
          preco: servico.preco
        }));

        setServicosDisponiveis(servicosFormatados);
      } catch (error) {
        console.error("Erro ao carregar serviços adicionais:", error);
        toast.error("Não foi possível carregar as opções de serviços extras.");
      }
    };

    carregarServicos();
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsServiceOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!room || !checkIn || !checkOut) {
    return (
      <div className={styles.container}>
        <div className={styles.errorBox}>
          <p>Dados da reserva não encontrados. Por favor, selecione um quarto novamente.</p>
          <button className={styles.backButton} onClick={() => navigate('/')}>
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  const dateIn = new Date(checkIn);
  const dateOut = new Date(checkOut);
  const diffTime = Math.abs(dateOut.getTime() - dateIn.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const valorDiaria = room?.categoria?.precoDiaria || 0;
  const subtotal = valorDiaria * diffDays;
  const taxaLimpeza = 120.00;

  // Cálculo dos serviços selecionados
  const totalServicos = servicosDisponiveis
    .filter(s => selectedServices.includes(s.id!))
    .reduce((acc, curr) => acc + curr.preco, 0);

  const totalGeral = subtotal + taxaLimpeza + totalServicos;

  const handleConfirmReservation = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    // Lembrete: Se você ajustou o JWT Decoder, o ID do cliente deve ser adicionado aqui!
    const reservationData = {
      dataCheckinPrevisto: checkIn,
      dataCheckoutPrevisto: checkOut,
      quartoId: room.id,
      servicosAdicionaisIds: selectedServices // Enviando os serviços escolhidos
    };

    if (!token) {
      toast.error("Sessão expirada. Por favor, faça login novamente.");
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(reservationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao confirmar reserva');
      }

      toast.success('Reserva confirmada com sucesso!');
      navigate('/home'); 
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Falha na comunicação";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
          Voltar e editar
        </button>
        <h1 className={styles.mainTitle}>Confirmação da sua Reserva</h1>
      </header>

      <div className={styles.contentGrid}>
        <section className={styles.detailsColumn}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Sua viagem</h2>
            <div className={styles.tripInfo}>
              <div className={styles.infoBlock}>
                <p className={styles.label}>Datas</p>
                <p className={styles.value}>
                  {dateIn.toLocaleDateString('pt-BR')} até {dateOut.toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className={styles.infoBlock}>
                <p className={styles.label}>Tempo de estadia</p>
                <p className={styles.value}>{diffDays} {diffDays === 1 ? 'noite' : 'noites'}</p>
              </div>
            </div>
          </div>

          {/* SELEÇÃO DE SERVIÇOS ADICIONAIS */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Serviços Adicionais</h2>
            <p className={styles.sectionSubtitle}>Personalize sua estadia com itens extras:</p>
            
            <div className={styles.customSelectContainer} ref={dropdownRef}>
              <div 
                className={`${styles.customSelectTrigger} ${isServiceOpen ? styles.open : ''}`}
                onClick={() => setIsServiceOpen(!isServiceOpen)}
              >
                <span>
                  {selectedServices.length > 0 
                    ? `${selectedServices.length} selecionado(s)` 
                    : "Deseja adicionar algo?"}
                </span>
                {isServiceOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>

              {isServiceOpen && (
                <div className={styles.customOptionsList}>
                  {servicosDisponiveis.map(serv => (
                    <label key={serv.id} className={styles.optionItemSimple}>
                      <input 
                        type="checkbox" 
                        checked={selectedServices.includes(serv.id!)}
                        onChange={() => {
                          setSelectedServices(prev => 
                            prev.includes(serv.id!) ? prev.filter(id => id !== serv.id) : [...prev, serv.id!]
                          );
                        }}
                      />
                      <div className={styles.optionText}>
                        <span className={styles.serviceName}>{serv.nomeServico}</span>
                        <span className={styles.servicePrice}>+ R$ {serv.preco.toFixed(2)}</span>
                      </div>
                    </label>
                  ))}
                  {servicosDisponiveis.length === 0 && (
                     <div style={{ padding: '12px', color: '#666', fontSize: '14px' }}>
                       Nenhum serviço disponível no momento.
                     </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className={styles.section}>
             <h2 className={styles.sectionTitle}>Regras e Políticas</h2>
             <ul className={styles.policyList}>
               <li>Cancelamento gratuito por 24 horas após a confirmação.</li>
               <li>Não é permitido fumar dentro das acomodações.</li>
             </ul>
          </div>
        </section>

        <aside className={styles.priceCard}>
          <div className={styles.roomPreview}>
            <img 
              src={room.image || "https://images.unsplash.com/photo-1590490360182-c33d57733427"} 
              alt="Quarto" 
            />
            <div className={styles.roomMeta}>
              <span className={styles.categoryBadge}>{room.type}</span>
              <h3>{room.description}</h3>
            </div>
          </div>

          <hr className={styles.divider} />

          <div className={styles.priceDetails}>
            <h4 className={styles.detailsTitle}>Resumo de valores</h4>
            <div className={styles.priceRow}>
              <span>{room.price} x {diffDays} noites</span>
              <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className={styles.priceRow}>
              <span>Taxa de limpeza fixa</span>
              <span>R$ {taxaLimpeza.toFixed(2).replace('.', ',')}</span>
            </div>

            {/* Linha dinâmica de serviços no resumo */}
            {totalServicos > 0 && (
              <div className={styles.priceRow}>
                <span>Serviços adicionais</span>
                <span>R$ {totalServicos.toFixed(2).replace('.', ',')}</span>
              </div>
            )}
            
            <div className={`${styles.priceRow} ${styles.totalRow}`}>
              <strong>Total (BRL)</strong>
              <strong>R$ {totalGeral.toFixed(2).replace('.', ',')}</strong>
            </div>
          </div>

          <button 
            className={styles.confirmButton} 
            onClick={handleConfirmReservation}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 size={20} className={styles.spinner} /> : <CheckCircle size={20} />}
            {isSubmitting ? 'Processando...' : 'Confirmar e Reservar'}
          </button>
          <p className={styles.secureNote}>Pagamento processado no check-in</p>
        </aside>
      </div>
    </div>
  );
};

export default ReservationConfirm;