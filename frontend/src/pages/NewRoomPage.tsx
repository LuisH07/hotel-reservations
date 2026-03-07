import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NewRoomPage.module.css';
import toast from 'react-hot-toast';
import CategoryModal from '../components/room/CategoryModal';

// Importações dos serviços (Ajuste os caminhos se necessário)
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService';
import { getComodidades, createComodidade, updateComodidade, deleteComodidade } from '../services/comodidadesService';
import { createQuarto, type CreateRoomRequest } from '../services/roomService'; // <-- Nova importação do serviço de quarto

interface Item {
  id: number;
  nome: string;
}

export interface Categoria {
  id?: number;
  precoDiaria: number;
  nome: string;
  capacidade: number;
}

const NewRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const editInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Estados de Dados
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [comodidades, setComodidades] = useState<Item[]>([]);

  // Estados de Controle
  const [selectedCat, setSelectedCat] = useState<Categoria | null>(null);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selectedComods, setSelectedComods] = useState<number[]>([]);
  const [isAddingComod, setIsAddingComod] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false); // <-- Controle de loading do form principal
  
  // Controle do Modal de Categoria
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Categoria | null>(null);

  // Controle de Edição de Comodidade
  const [editingComod, setEditingComod] = useState<Item | null>(null);

  // Carregar categorias e comodidades ao montar a página
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const dados = await getCategories();
        setCategorias(dados);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        toast.error("Erro ao carregar as categorias.");
      }
    };

    const fetchComodidades = async () => {
      try {
        const dados = await getComodidades();
        setComodidades(dados as Item[]);
      } catch (error) {
        console.error("Erro ao buscar comodidades:", error);
        toast.error("Erro ao carregar as comodidades.");
      }
    };

    fetchCategorias();
    fetchComodidades();
  }, []);

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

  // Handlers de Comodidade integrados com Backend
  const handleAddQuickComod = async (nome: string) => {
    if (!nome.trim()) return;
    try {
      const novaComod = await createComodidade({ nome });
      setComodidades([...comodidades, novaComod as Item]);
      toast.success("Comodidade criada!");
    } catch (error) {
      console.error("Erro ao criar comodidade:", error);
      toast.error("Erro ao criar a comodidade.");
    }
  };

  const handleUpdateComod = async () => {
    const novoNome = editInputRef.current?.value;
    if (!editingComod || !novoNome) return;
    
    try {
      const atualizada = await updateComodidade(editingComod.id, { nome: novoNome });
      setComodidades(prev => prev.map(i => i.id === editingComod.id ? (atualizada as Item) : i));
      setEditingComod(null);
      toast.success("Comodidade atualizada!");
    } catch (error) {
      console.error("Erro ao atualizar comodidade:", error);
      toast.error("Erro ao atualizar a comodidade.");
    }
  };

  // Handlers de Categoria integrados com Backend
  const handleSaveCategory = async (novaCat: Categoria) => {
    try {
      if (categoryToEdit && categoryToEdit.id) {
        const atualizada = await updateCategory(categoryToEdit.id, novaCat);
        setCategorias(prev => prev.map(c => c.id === categoryToEdit.id ? atualizada : c));
        
        if (selectedCat?.id === categoryToEdit.id) {
          setSelectedCat(atualizada);
        }
        toast.success("Categoria atualizada com sucesso!");
      } else {
        const criada = await createCategory(novaCat);
        setCategorias([...categorias, criada]);
        toast.success("Categoria cadastrada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      toast.error("Ocorreu um erro ao salvar a categoria.");
    } finally {
      setIsAddingCat(false);
      setCategoryToEdit(null);
    }
  };

  const handleDeleteItem = (id: number, tipo: 'cat' | 'com') => {
    toast((t) => (
      <span className={styles.toastConfirm}>
        Excluir {tipo === 'cat' ? 'categoria' : 'comodidade'}?
        <button onClick={async () => {
          if (tipo === 'cat') {
            try {
              await deleteCategory(id);
              setCategorias(prev => prev.filter(i => i.id !== id));
              if (selectedCat?.id === id) setSelectedCat(null);
              toast.success("Categoria removida!");
            } catch (error) {
              console.error("Erro ao deletar categoria:", error);
              toast.error("Erro ao excluir. Pode estar em uso.");
            }
          } else {
            try {
              await deleteComodidade(id);
              setComodidades(prev => prev.filter(i => i.id !== id));
              setSelectedComods(prev => prev.filter(item => item !== id));
              toast.success("Comodidade removida!");
            } catch (error) {
              console.error("Erro ao deletar comodidade:", error);
              toast.error("Erro ao excluir. Pode estar em uso.");
            }
          }
          toast.dismiss(t.id);
        }} className={styles.toastBtnSim}>Sim</button>
        <button onClick={() => toast.dismiss(t.id)} className={styles.toastBtnNao}>Não</button>
      </span>
    ));
  };

  // --- FUNÇÃO INTEGRADA PARA SALVAR O QUARTO ---
  const handleSubmitFinal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedCat?.id) {
      return toast.error("Selecione uma categoria para o quarto!");
    }

    const formData = new FormData(e.currentTarget);
    const numeroStr = formData.get('numero') as string;
    const areaStr = formData.get('area') as string;

    if (!numeroStr.trim()) {
      return toast.error("Preencha o número do quarto!");
    }

    // Montando o payload exato esperado pelo backend
    const payload: CreateRoomRequest = {
      hotelId: 1, 
      categoriaId: selectedCat.id,
      numero: numeroStr,
      area: areaStr ? Number(areaStr) : undefined,
      comodidadeIds: selectedComods,
      status: 'DISPONIVEL' // Status padrão
    };

    setIsSubmittingForm(true);

    try {
      await createQuarto(payload);
      toast.success("Quarto cadastrado com sucesso!");
      navigate('/quartos');
    } catch (error) {
      console.error("Erro ao cadastrar quarto:", error);
      toast.error("Erro ao cadastrar o quarto.");
    } finally {
      setIsSubmittingForm(false);
    }
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
            <input name="numero" type="text" placeholder="Ex: 101-A" required disabled={isSubmittingForm} />
          </div>
          <div className={styles.inputGroup}>
            <label>Área (m²)</label>
            <input name="area" type="number" step="0.01" placeholder="0.00" disabled={isSubmittingForm} />
          </div>
        </div>

        {/* CATEGORIA CUSTOM SELECT */}
        <div className={styles.inputGroup}>
          <div className={styles.labelWithAction}>
            <label>Categoria</label>
            <button type="button" className={styles.textActionBtn} onClick={() => setIsAddingCat(true)} disabled={isSubmittingForm}>
              + Nova Categoria
            </button>
          </div>

          <div className={styles.customSelectContainer} ref={dropdownRef}>
            <div 
              className={`${styles.customSelectTrigger} ${isSelectOpen ? styles.open : ''} ${isSubmittingForm ? styles.disabled : ''}`}
              onClick={() => !isSubmittingForm && setIsSelectOpen(!isSelectOpen)}
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
                        setCategoryToEdit(cat); 
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button type="button" className={styles.deleteIcon} onClick={(e) => { 
                        e.stopPropagation(); 
                        if (cat.id) handleDeleteItem(cat.id, 'cat'); 
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
                <span className={styles.chipText} onClick={() => !isSubmittingForm && setSelectedComods(prev => prev.includes(com.id) ? prev.filter(i => i !== com.id) : [...prev, com.id])}>
                  {com.nome}
                </span>
                <div className={styles.chipActions}>
                  <button type="button" className={styles.editIcon} onClick={() => !isSubmittingForm && setEditingComod(com)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button type="button" className={styles.deleteIcon} onClick={() => !isSubmittingForm && handleDeleteItem(com.id, 'com')}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            ))}
            {isAddingComod ? (
              <input 
                className={styles.inlineInput} 
                autoFocus 
                disabled={isSubmittingForm}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddQuickComod(e.currentTarget.value);
                    setIsAddingComod(false);
                  }
                }} 
                onBlur={() => setIsAddingComod(false)} 
              />
            ) : (
              <button type="button" className={styles.addChipBtn} onClick={() => !isSubmittingForm && setIsAddingComod(true)}>+ Adicionar</button>
            )}
          </div>
        </div>

        <div className={styles.formFooter}>
          <button type="submit" className={styles.saveBtn} disabled={isSubmittingForm}>
            {isSubmittingForm ? 'Cadastrando...' : 'Cadastrar Quarto'}
          </button>
        </div>
      </form>

      {/* MODAL DE CATEGORIA */}
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
            <input 
              ref={editInputRef} 
              autoFocus 
              defaultValue={editingComod.nome} 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleUpdateComod();
                }
              }} 
            />
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