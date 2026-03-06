import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoomCard from '../components/room/RoomCard';
import styles from './RoomsListPage.module.css';
import toast from 'react-hot-toast';
import { getRoomsByHotel, deleteRoomService, type Room } from '../services/roomService';

const Rooms: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<number | null>(null);

  const HOTEL_ID = 1; 

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const data = await getRoomsByHotel(HOTEL_ID);
        setRooms(data);
      } catch (error) {
        console.error("Não foi possivel carregar os quartos: ", error);
        toast.error("Não foi possível carregar os quartos.");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [HOTEL_ID]);

  const confirmDelete = async () => {
    if (!roomToDelete) return;

    try {
      await deleteRoomService(roomToDelete);
      
      setRooms(prev => prev.filter(room => room.id !== roomToDelete));
      toast.success("Quarto excluído com sucesso!");
      
    } catch (error: unknown) {
    
      if (error instanceof Error) {
        toast.error(error.message, { duration: 5000 });
      } else {
        toast.error("Erro inesperado ao excluir o quarto.", { duration: 5000 });
      }
      
    } finally {
      setRoomToDelete(null);
    }
  };

  const openModal = (room: Room) => {
    setSelectedRoom(room);
    setIsEditMode(false);
  };

  const closeModal = () => {
    setSelectedRoom(null);
    setIsEditMode(false);
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Carregando quartos...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Gerenciamento de Quartos</h1>
          <p>{rooms.length} quartos cadastrados no sistema</p>
        </div>
        <button 
          className={styles.addButton} 
          onClick={() => navigate('/quartos/novo')}
        >
          + Novo Quarto
        </button>
      </header>

      {rooms.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nenhum quarto encontrado para este hotel.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {rooms.map(room => (
            <RoomCard 
              key={room.id}
              id={room.id}
              type={room.categoria.nome}
              description={`Quarto ${room.numero} • ${room.area}m²`}
              price={`R$ ${room.categoria.precoDiaria.toFixed(2)} / noite`}
              image={room.image || "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80"}
              onCardClick={() => openModal(room)}
              onDelete={() => setRoomToDelete(room.id)}
            />
          ))}
        </div>
      )}

      {/* POPUP DE CONFIRMAÇÃO DE DELEÇÃO */}
      {roomToDelete && (
        <div className={styles.modalOverlay} onClick={() => setRoomToDelete(null)}>
          <div className={styles.deletePopup} onClick={e => e.stopPropagation()}>
            <div className={styles.warningIcon}>⚠️</div>
            <h3>Confirmar Exclusão</h3>
            <p>
              Tem certeza que deseja excluir o quarto <strong>#{roomToDelete}</strong>? 
            </p>
            <div className={styles.popupActions}>
              <button className={styles.cancelBtn} onClick={() => setRoomToDelete(null)}>
                Cancelar
              </button>
              <button className={styles.confirmDeleteBtn} onClick={confirmDelete}>
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DETALHES / EDIÇÃO */}
      {selectedRoom && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={`${styles.modalContent} ${isEditMode ? styles.editMode : ''}`} onClick={e => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <h2>{isEditMode ? `Editando Quarto ${selectedRoom.numero}` : `Detalhes do Quarto ${selectedRoom.numero}`}</h2>
              <span className={`${styles.badge} ${styles[selectedRoom.status.toLowerCase()]}`}>
                {selectedRoom.status}
              </span>
            </header>

            <div className={styles.modalBody}>
              <div className={styles.modalImageContainer}>
                <img 
                  src={selectedRoom.image || "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80"} 
                  alt="Quarto" 
                  className={styles.modalMainImage} 
                />
              </div>

              {isEditMode ? (
                <form className={styles.editForm}>
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label>Número</label>
                      <input type="text" defaultValue={selectedRoom.numero} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Área (m²)</label>
                      <input type="number" defaultValue={selectedRoom.area} />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label>Status</label>
                      <select defaultValue={selectedRoom.status}>
                        <option value="DISPONIVEL">Disponível</option>
                        <option value="OCUPADO">Ocupado</option>
                        <option value="MANUTENCAO">Manutenção</option>
                      </select>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Categoria</label>
                      <select defaultValue={selectedRoom.categoria.id}>
                        <option value={selectedRoom.categoria.id}>{selectedRoom.categoria.nome}</option>
                      </select>
                    </div>
                  </div>
                </form>
              ) : (
                <div className={styles.viewDetails}>
                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}><strong>Categoria</strong><span>{selectedRoom.categoria.nome}</span></div>
                    <div className={styles.detailItem}><strong>Área</strong><span>{selectedRoom.area} m²</span></div>
                    <div className={styles.detailItem}><strong>Capacidade</strong><span>{selectedRoom.categoria.capacidade} Pessoas</span></div>
                    <div className={styles.detailItem}><strong>Preço</strong><span className={styles.highlightPrice}>R$ {selectedRoom.categoria.precoDiaria.toFixed(2)}</span></div>
                  </div>
                  
                  {/* Exibição das Comodidades no Detalhe */}
                  <div className={styles.comodidadesList}>
                    <strong>Comodidades:</strong>
                    <div className={styles.chipsContainer}>
                      {selectedRoom.comodidades.map(com => (
                        <span key={com.id} className={styles.comodidadeChip}>{com.nome}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <footer className={styles.modalFooter}>
              <button className={styles.secondaryBtn} onClick={() => setIsEditMode(!isEditMode)}>
                {isEditMode ? 'Cancelar' : 'Editar Dados'}
              </button>
              <button className={styles.primaryBtn} onClick={isEditMode ? () => { toast.success("Funcionalidade em desenvolvimento!"); closeModal(); } : closeModal}>
                {isEditMode ? 'Salvar' : 'Fechar'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;