import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import styles from './ReservationConfirm.module.css';
import { ChevronLeft, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ReservationConfirm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resgatando o estado enviado pela RoomPage (via navigate)
  const { room, checkIn, checkOut } = location.state || {};

  // Proteção de rota: se não houver dados, volta para a home
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

  // Cálculo de noites e parsing do preço
  const dateIn = new Date(checkIn);
  const dateOut = new Date(checkOut);
  const diffTime = Math.abs(dateOut.getTime() - dateIn.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Limpa a string "R$ 450,00" para o número 450.00
  const valorDiaria = room?.categoria?.precoDiaria || 0;
  const subtotal = valorDiaria * diffDays;
  const taxaLimpeza = 120.00;
  const totalGeral = subtotal + taxaLimpeza;

  const handleConfirmReservation = async () => {
    setIsSubmitting(true);

    const token = localStorage.getItem('token');

    const reservationData = {
      dataCheckinPrevisto: checkIn,
      dataCheckoutPrevisto: checkOut,
      quartoIds: [room.id]
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
        throw new Error(errorData.message || 'Erro ao confirmar reserva no servidor');
      }

      toast.success('Reserva confirmada com sucesso! Aproveite sua estadia.');
      navigate('/home'); 
      
    } catch (err: unknown) {
      let errorMessage = "Falha na comunicação com o servidor";
      if (err instanceof Error) errorMessage = err.message;
      
      console.error('Erro na reserva:', err);
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
        {/* COLUNA ESQUERDA - DETALHES DA ESTADIA */}
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
              <div className={styles.infoBlock}>
                <p className={styles.label}>Check-in</p>
                <p className={styles.value}>A partir das 14:00</p>
              </div>
            </div>
          </div>
          
          <div className={styles.section}>
             <h2 className={styles.sectionTitle}>Regras e Políticas</h2>
             <ul className={styles.policyList}>
               <li>Cancelamento gratuito por 24 horas após a confirmação.</li>
               <li>Não é permitido fumar dentro das acomodações.</li>
               <li>Apresente um documento oficial com foto no check-in.</li>
             </ul>
          </div>
        </section>

        {/* COLUNA DIREITA - RESUMO FINANCEIRO */}
        <aside className={styles.priceCard}>
          <div className={styles.roomPreview}>
            <img 
              src={room.image || "https://images.unsplash.com/photo-1590490360182-c33d57733427"} 
              alt="Quarto selecionado" 
            />
            <div className={styles.roomMeta}>
              <span className={styles.categoryBadge}>{room.type}</span>
              <h3>{room.description}</h3>
              <p className={styles.roomId}>Identificação: #{room.id}</p>
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
            {isSubmitting ? (
              <Loader2 size={20} className={styles.spinner} />
            ) : (
              <CheckCircle size={20} />
            )}
            {isSubmitting ? 'Processando reserva...' : 'Confirmar e Reservar'}
          </button>
          
          <p className={styles.secureNote}>Pagamento processado no check-in</p>
        </aside>
      </div>
    </div>
  );
};

export default ReservationConfirm;