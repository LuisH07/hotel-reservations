import React, { useState } from 'react';
import styles from '../../pages/NewRoomPage.module.css';

export interface CategoryData {
  id?: number;
  nome: string;
  precoDiaria: number;
  capacidade: number;
}

interface CategoryModalProps {
  onClose: () => void;
  // Alterado para suportar chamadas assíncronas
  onSave: (categoria: CategoryData) => Promise<void> | void; 
  initialData?: CategoryData | null; 
}

const CategoryModal: React.FC<CategoryModalProps> = ({ onClose, onSave, initialData }) => {
  const isEditing = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    setIsSubmitting(true);
    
    try {
      await onSave({
        id: initialData?.id,
        nome: formData.get('nome') as string,
        precoDiaria: Number(formData.get('precoDiaria')),
        capacidade: Number(formData.get('capacidade')),
      });
    } finally {
      // Libera o botão independente de dar erro ou sucesso
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.miniDialog} style={{ width: '400px' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>
          {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Nome da Categoria</label>
            <input 
              name="nome" 
              type="text" 
              placeholder="Ex: Suíte Master" 
              defaultValue={initialData?.nome} 
              required 
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Diária (R$)</label>
              <input 
                name="precoDiaria" 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                defaultValue={initialData?.precoDiaria} 
                required 
                disabled={isSubmitting}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Capacidade</label>
              <input 
                name="capacidade" 
                type="number" 
                placeholder="Ex: 2" 
                defaultValue={initialData?.capacidade} 
                required 
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className={styles.dialogBtns} style={{ marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className={styles.confirmBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Criar Categoria')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;