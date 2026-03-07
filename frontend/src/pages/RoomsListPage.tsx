import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoomCard from '../components/room/RoomCard';
import styles from './RoomsListPage.module.css';
import toast from 'react-hot-toast';
import { getRoomsByHotel, deleteRoomService, updateRoomService, type Room } from '../services/roomService';
import { getComodidades } from '../services/comodidadesService'; 

interface Item {
  id: number;
  nome: string;
}

const Rooms: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [allComodidades, setAllComodidades] = useState<Item[]>([]); 
  const [loading, setLoading] = useState(true);
  
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedComodsEdit, setSelectedComodsEdit] = useState<number[]>([]); 
  const [roomToDelete, setRoomToDelete] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const HOTEL_ID = 1; 

  // Busca os quartos E as comodidades ao abrir a página
  useEffect(() => {
    const fetchDados = async () => {
      try {
        setLoading(true);
        const [quartosData, comodidadesData] = await Promise.all([
          getRoomsByHotel(HOTEL_ID),
          getComodidades()
        ]);
        setRooms(quartosData);
        setAllComodidades(comodidadesData as Item[]);
      } catch (error) {
        console.error("Não foi possivel carregar os dados: ", error);
        toast.error("Não foi possível carregar os dados dos quartos.");
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
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

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRoom || !selectedRoom.id) return;

    const formData = new FormData(e.currentTarget);
    
    // PAYLOAD COMPLETO PARA O PUT REQUEST
    const payload = {
      hotelId: HOTEL_ID,
      categoriaId: selectedRoom.categoria.id, // Mantendo a categoria atual do quarto
      numero: formData.get('numero') as string,
      area: Number(formData.get('area')),
      status: formData.get('status') as string, // Ajustado para o DTO
      comodidadeIds: selectedComodsEdit 
    };

    setIsSubmitting(true);

    try {
      // Usando 'any' temporário caso não tenha atualizado o service ainda
      const success = await updateRoomService(selectedRoom.id, payload as any);
      
      if (success) {
        const updatedComodidades = allComodidades.filter(c => selectedComodsEdit.includes(c.id));
        
        // Atualiza a listagem local para o React reagir sem precisar recarregar
        const quartoAtualizado: Room = { 
          ...selectedRoom, 
          numero: payload.numero,
          area: payload.area,
          status: payload.status as Room['status'],
          comodidades: updatedComodidades as any 
        };

        setRooms(prev => prev.map(room => room.id === selectedRoom.id ? quartoAtualizado : room));
        setSelectedRoom(quartoAtualizado);
        
        toast.success("Quarto atualizado com sucesso!");
        setIsEditMode(false);
      } else {
        toast.error("Erro ao atualizar o quarto.");
      }
    } catch (error) {
      toast.error("Erro inesperado ao salvar alterações.");
    } finally {
      setIsSubmitting(false);
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

  const toggleEditMode = () => {
    if (!isEditMode && selectedRoom) {
      setSelectedComodsEdit(selectedRoom.comodidades.map(c => c.id));
    }
    setIsEditMode(!isEditMode);
  };

  const toggleComodidadeEdit = (id: number) => {
    setSelectedComodsEdit(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
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
        <button className={styles.addButton} onClick={() => navigate('/quartos/novo')}>
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
              id={room.id!}
              type={room.categoria.nome}
              description={`Quarto ${room.numero} • ${room.area}m²`}
              price={`R$ ${room.categoria.precoDiaria.toFixed(2)} / noite`}
              image={room.image || "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80"}
              onCardClick={() => openModal(room)}
              onDelete={() => setRoomToDelete(room.id!)}
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
            <p>Tem certeza que deseja excluir o quarto <strong>#{roomToDelete}</strong>?</p>
            <div className={styles.popupActions}>
              <button className={styles.cancelBtn} onClick={() => setRoomToDelete(null)}>Cancelar</button>
              <button className={styles.confirmDeleteBtn} onClick={confirmDelete}>Sim, Excluir</button>
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
                <form id="editRoomForm" className={styles.editForm} onSubmit={handleEditSubmit}>
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label>Número</label>
                      <input name="numero" type="text" defaultValue={selectedRoom.numero} required />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Área (m²)</label>
                      <input name="area" type="number" step="0.01" defaultValue={selectedRoom.area} required />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label>Status</label>
                      <select name="status" defaultValue={selectedRoom.status}>
                        <option value="DISPONIVEL">Disponível</option>
                        <option value="LIMPEZA">Limpeza</option>
                        <option value="MANUTENCAO">Manutenção</option>
                      </select>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Categoria</label>
                      <select name="categoriaId" defaultValue={selectedRoom.categoria.id} disabled>
                        <option value={selectedRoom.categoria.id}>{selectedRoom.categoria.nome}</option>
                      </select>
                    </div>
                  </div>

                  {/* SELEÇÃO DE COMODIDADES NA EDIÇÃO */}
                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                    <label>Comodidades</label>
                    <div className={styles.chipsContainer} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                      {allComodidades.map(com => {
                        const isSelected = selectedComodsEdit.includes(com.id);
                        return (
                          <span 
                            key={com.id} 
                            onClick={() => toggleComodidadeEdit(com.id)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '16px',
                              fontSize: '0.875rem',
                              cursor: 'pointer',
                              fontWeight: 500,
                              transition: 'all 0.2s',
                              backgroundColor: isSelected ? '#3b82f6' : '#e2e8f0',
                              color: isSelected ? '#ffffff' : '#475569',
                              border: isSelected ? '1px solid #2563eb' : '1px solid transparent'
                            }}
                          >
                            {com.nome}
                          </span>
                        );
                      })}
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
                    <div className={styles.chipsContainer} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                      {selectedRoom.comodidades.map(com => (
                        <span 
                          key={com.id} 
                          style={{
                            padding: '4px 10px',
                            borderRadius: '16px',
                            fontSize: '0.875rem',
                            backgroundColor: '#f1f5f9',
                            color: '#334155',
                            border: '1px solid #cbd5e1'
                          }}
                        >
                          {com.nome}
                        </span>
                      ))}
                      {selectedRoom.comodidades.length === 0 && (
                        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Nenhuma comodidade registrada.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <footer className={styles.modalFooter}>
              <button 
                type="button" 
                className={styles.secondaryBtn} 
                onClick={toggleEditMode}
                disabled={isSubmitting}
              >
                {isEditMode ? 'Cancelar' : 'Editar Dados'}
              </button>
              
              {isEditMode ? (
                <button 
                  type="submit" 
                  form="editRoomForm" 
                  className={styles.primaryBtn} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </button>
              ) : (
                <button type="button" className={styles.primaryBtn} onClick={closeModal}>
                  Fechar
                </button>
              )}
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;