import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NewRoomPage.module.css';
import toast from 'react-hot-toast';
import CategoryModal from '../components/room/CategoryModal';

interface Item {
  id: number;
  nome: string;
  precoDiaria?: number;
  capacidade?: number;
}

interface Categoria {
  id?: number;
  precoDiaria: number;
  nome: string;
  capacidade: number;
}

const NewRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const editInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mocks iniciais
  const [categorias, setCategorias] = useState<Item[]>([
    { id: 1, nome: 'Standard Solo', precoDiaria: 150, capacidade: 1 },
    { id: 2, nome: 'Double Deluxe', precoDiaria: 300, capacidade: 2 }
  ]);
  const [comodidades, setComodidades] = useState<Item[]>([
    { id: 1, nome: 'Wi-Fi' },
    { id: 2, nome: 'Ar Condicionado' }
  ]);

  // Estados de Controle
  const [selectedCat, setSelectedCat] = useState<Item | null>(null);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selectedComods, setSelectedComods] = useState<number[]>([]);
  const [isAddingComod, setIsAddingComod] = useState(false);
  
  // Controle do Modal de Categoria (Criação e Edição)
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Categoria | null>(null);

  // Controle de Edição de Comodidade (Modal Simples)
  const [editingComod, setEditingComod] = useState<Item | null>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSelectOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers de Comodidade
  const handleAddQuickComod = (nome: string) => {
    if (!nome.trim()) return;
    setComodidades([...comodidades, { id: Date.now(), nome }]);
    toast.success("Comodidade criada!");
  };

  const handleUpdateComod = () => {
    const novoNome = editInputRef.current?.value;
    if (!editingComod || !novoNome) return;
    setComodidades(prev => prev.map(i => i.id === editingComod.id ? { ...i, nome: novoNome } : i));
    setEditingComod(null);
    toast.success("Comodidade atualizada!");
  };

  // Handlers de Categoria
  const handleSaveCategory = (novaCat: Categoria) => {
    if (categoryToEdit) {
      // Modo Edição
      setCategorias(prev => prev.map(c => c.id === categoryToEdit.id ? { ...novaCat, id: c.id } : c));
      if (selectedCat?.id && categoryToEdit?.id && selectedCat.id === categoryToEdit.id) {
        setSelectedCat({ ...novaCat, id: categoryToEdit.id });
      }
      toast.success("Categoria atualizada!");
    } else {
      // Modo Criação
      const itemNovo = { ...novaCat, id: Date.now() };
      setCategorias([...categorias, itemNovo]);
      toast.success("Categoria criada!");
    }
    setIsAddingCat(false);
    setCategoryToEdit(null);
  };

  const handleDeleteItem = (id: number, tipo: 'cat' | 'com') => {
    toast((t) => (
      <span className={styles.toastConfirm}>
        Excluir {tipo === 'cat' ? 'categoria' : 'comodidade'}?
        <button onClick={() => {
          if (tipo === 'cat') {
            setCategorias(prev => prev.filter(i => i.id !== id));
            if (selectedCat?.id === id) setSelectedCat(null);
          } else {
            setComodidades(prev => prev.filter(i => i.id !== id));
            setSelectedComods(prev => prev.filter(item => item !== id));
          }
          toast.dismiss(t.id);
          toast.error("Removido!");
        }} className={styles.toastBtnSim}>Sim</button>
        <button onClick={() => toast.dismiss(t.id)} className={styles.toastBtnNao}>Não</button>
      </span>
    ));
  };

  const handleSubmitFinal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      numero: formData.get('numero'),
      area: formData.get('area'),
      categoria: { id: selectedCat?.id },
      comodidades: selectedComods.map(id => ({ id }))
    };

    if (!payload.categoria.id || !payload.numero) {
      return toast.error("Preencha número e categoria!");
    }
    console.log("Payload:", payload);
    toast.success("Quarto cadastrado!");
    navigate('/quartos');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/quartos')}>
          <span className={styles.iconArrow}>←</span> Voltar
        </button>
        <h1>Novo Quarto</h1>
      </header>

      <form className={styles.mainForm} onSubmit={handleSubmitFinal}>
        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label>Número do Quarto</label>
            <input name="numero" type="text" placeholder="Ex: 101-A" required />
          </div>
          <div className={styles.inputGroup}>
            <label>Área (m²)</label>
            <input name="area" type="number" step="0.01" placeholder="0.00" />
          </div>
        </div>

        {/* CATEGORIA CUSTOM SELECT */}
        <div className={styles.inputGroup}>
          <div className={styles.labelWithAction}>
            <label>Categoria</label>
            <button type="button" className={styles.textActionBtn} onClick={() => setIsAddingCat(true)}>
              + Nova Categoria
            </button>
          </div>

          <div className={styles.customSelectContainer} ref={dropdownRef}>
            <div 
              className={`${styles.customSelectTrigger} ${isSelectOpen ? styles.open : ''}`}
              onClick={() => setIsSelectOpen(!isSelectOpen)}
            >
              <span>{selectedCat ? selectedCat.nome : "Selecione uma categoria..."}</span>
              <span className={styles.arrow}>{isSelectOpen ? '▲' : '▼'}</span>
            </div>

            {isSelectOpen && (
              <div className={styles.customOptionsList}>
                {categorias.map(cat => (
                  <div key={cat.id} className={styles.customOptionItem}>
                    <span className={styles.optionText} onClick={() => { setSelectedCat(cat); setIsSelectOpen(false); }}>
                      {cat.nome}
                    </span>
                    <div className={styles.optionActions}>
                      <button type="button" className={styles.editIcon} onClick={(e) => { 
                        e.stopPropagation(); 
                        setCategoryToEdit(cat as Categoria); 
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button type="button" className={styles.deleteIcon} onClick={(e) => { 
                        e.stopPropagation(); 
                        handleDeleteItem(cat.id, 'cat'); 
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COMODIDADES */}
        <div className={styles.inputGroup}>
          <label>Comodidades</label>
          <div className={styles.chipsGrid}>
            {comodidades.map(com => (
              <div key={com.id} className={`${styles.chipWrapper} ${selectedComods.includes(com.id) ? styles.chipSelected : ''}`}>
                <span className={styles.chipText} onClick={() => setSelectedComods(prev => prev.includes(com.id) ? prev.filter(i => i !== com.id) : [...prev, com.id])}>
                  {com.nome}
                </span>
                <div className={styles.chipActions}>
                  <button type="button" className={styles.editIcon} onClick={() => setEditingComod(com)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button type="button" className={styles.deleteIcon} onClick={() => handleDeleteItem(com.id, 'com')}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            ))}
            {isAddingComod ? (
              <input className={styles.inlineInput} autoFocus onKeyDown={(e) => e.key === 'Enter' && (handleAddQuickComod(e.currentTarget.value), setIsAddingComod(false))} onBlur={() => setIsAddingComod(false)} />
            ) : (
              <button type="button" className={styles.addChipBtn} onClick={() => setIsAddingComod(true)}>+ Adicionar</button>
            )}
          </div>
        </div>

        <div className={styles.formFooter}>
          <button type="submit" className={styles.saveBtn}>Cadastrar Quarto</button>
        </div>
      </form>

      {/* MODAL DE CATEGORIA (REUTILIZADO PARA CRIAR/EDITAR) */}
      {(isAddingCat || categoryToEdit) && (
        <CategoryModal 
          initialData={categoryToEdit}
          onClose={() => { setIsAddingCat(false); setCategoryToEdit(null); }}
          onSave={handleSaveCategory}
        />
      )}

      {/* MODAL SIMPLES PARA COMODIDADE */}
      {editingComod && (
        <div className={styles.overlay} onClick={() => setEditingComod(null)}>
          <div className={styles.miniDialog} onClick={e => e.stopPropagation()}>
            <p>Editar Comodidade</p>
            <input ref={editInputRef} autoFocus defaultValue={editingComod.nome} onKeyDown={(e) => e.key === 'Enter' && handleUpdateComod()} />
            <div className={styles.dialogBtns}>
              <button onClick={() => setEditingComod(null)}>Cancelar</button>
              <button className={styles.confirmBtn} onClick={handleUpdateComod}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewRoomPage;