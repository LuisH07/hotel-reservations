import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Search, 
  ArrowLeft, 
  CheckCircle, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import styles from './HospedagemFormPage.module.css';
import toast from 'react-hot-toast';
import AdditionalServiceModal from '../components/reservations/AdditionalModal';
import type { AdditionalServiceData } from '../components/reservations/AdditionalModal';
import { 
  getQuartosDisponiveis, 
  getClienteByCpf, 
  createHospedagem,
  getServicosAdicionais, // <--- Novo endpoint importado
  type CriarHospedagemRequest,
  type QuartoDisponivel 
} from '../services/hostingService';

export const HospedagemFormPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reservationData = location.state?.reservation;
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- Estados de Dados ---
  const [quartosDisponiveis, setQuartosDisponiveis] = useState<QuartoDisponivel[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingQuartos, setLoadingQuartos] = useState(false);

  // --- Estados dos Serviços Adicionais ---
  // Inicia vazio, será preenchido pelo useEffect
  const [servicosDisponiveis, setServicosDisponiveis] = useState<AdditionalServiceData[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<AdditionalServiceData | null>(null);

  // --- Estado do Formulário ---
  const [formData, setFormData] = useState({
    cpf: reservationData?.clientCpf || '',
    nome: reservationData?.clientName || '',
    reservaId: reservationData?.id || '',
    quartoId: reservationData?.roomId || '',
    dataEntrada: new Date().toISOString().split('T')[0],
    dataSaida: reservationData?.endDate || '',
    metodoPagamento: '',
  });

  const isFromReservation = !!reservationData;

  // --- Cálculos Dinâmicos ---
  const calcularNoites = (entrada: string, saida: string) => {
    if (!entrada || !saida) return 0;
    const dataIn = new Date(entrada);
    const dataOut = new Date(saida);
    const diffTime = dataOut.getTime() - dataIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const noites = calcularNoites(formData.dataEntrada, formData.dataSaida);

  // Define o valor da diária com base na reserva ou no quarto escolhido
  const precoDiaria = isFromReservation 
    ? (Number(reservationData.totalValue) / calcularNoites(reservationData.startDate, reservationData.endDate))
    : (quartosDisponiveis.find(q => q.id === Number(formData.quartoId))?.preco || 0);

  const valorHospedagem = noites * precoDiaria;

  const totalServicos = servicosDisponiveis
    .filter(s => selectedServices.includes(s.id!))
    .reduce((acc, curr) => acc + curr.preco, 0);
  
  const valorTotalFinal = valorHospedagem + totalServicos;

  // --- Efeitos ---
  // 1. Carregar Quartos
  useEffect(() => {
    const carregarQuartos = async () => {
      if (formData.dataEntrada && formData.dataSaida && !isFromReservation) {
        setLoadingQuartos(true);
        try {
          const data = await getQuartosDisponiveis(formData.dataEntrada, formData.dataSaida);
          setQuartosDisponiveis(data);
          if (!data.find(q => q.id === Number(formData.quartoId))) {
            setFormData(prev => ({ ...prev, quartoId: '' }));
          }
        } catch (error) {
          console.error("Erro ao buscar quartos:", error);
          toast.error("Erro ao buscar quartos para este período.");
        } finally {
          setLoadingQuartos(false);
        }
      }
    };
    carregarQuartos();
  }, [formData.dataEntrada, formData.dataSaida, isFromReservation, formData.quartoId]);

  // 2. Carregar Serviços (Resolvendo o erro de tipagem)
  useEffect(() => {
    const carregarServicos = async () => {
      try {
        const dados = await getServicosAdicionais();
        
        // Mapeamento para garantir que a descrição seja string (correção do erro TS)
        const servicosFormatados: AdditionalServiceData[] = dados.map(servico => ({
          id: servico.id,
          nomeServico: servico.nomeServico,
          descricao: servico.descricao || '', // Transforma undefined em string vazia
          preco: servico.preco
        }));

        setServicosDisponiveis(servicosFormatados);
      } catch (error) {
        console.error("Erro ao carregar serviços adicionais:", error);
        toast.error("Não foi possível carregar os serviços extras.");
      }
    };

    carregarServicos();
  }, []);

  // 3. Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsServiceDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Handlers ---
  const handleBuscarCliente = async () => {
    if (!formData.cpf) return toast.error("Digite um CPF para buscar");
    setLoadingSearch(true);
    
    const cpfLimpo = formData.cpf.replace(/\D/g, '');
    try {
      const cliente = await getClienteByCpf(cpfLimpo);
      setFormData(prev => ({ ...prev, nome: cliente.nome }));
      toast.success("Cliente localizado!");
    } catch (err) {
      console.log("Cliente nao encontrado ", err);
      toast.error("Cliente não encontrado.");
      setFormData(prev => ({ ...prev, nome: '' }));
    } finally {
      setLoadingSearch(false);
    }
  };

  // Handler de Salvar/Editar Serviço Adicional
  const handleSaveService = async (data: AdditionalServiceData) => {
    try {
      if (serviceToEdit) {
        // Se você tiver um endpoint PUT, coloque aqui: await api.put(`/servicos-adicionais/${serviceToEdit.id}`, data)
        setServicosDisponiveis(prev => prev.map(s => s.id === serviceToEdit.id ? { ...data, id: s.id } : s));
        toast.success("Serviço atualizado!");
      } else {
        // Se você tiver um endpoint POST, coloque aqui: const res = await api.post(`/servicos-adicionais`, data)
        const novoServico = { ...data, id: Date.now() }; // Use res.data se tiver backend
        setServicosDisponiveis([...servicosDisponiveis, novoServico]);
        toast.success("Serviço cadastrado!");
      }
    } catch (error) {
      toast.error("Erro ao salvar serviço.");
    } finally {
      setIsModalOpen(false);
      setServiceToEdit(null);
    }
  };

  // Handler de Excluir Serviço Adicional
  const handleDeleteService = async (id: number) => {
    try {
      // Se você tiver um endpoint DELETE, coloque aqui: await api.delete(`/servicos-adicionais/${id}`)
      setServicosDisponiveis(prev => prev.filter(s => s.id !== id));
      setSelectedServices(prev => prev.filter(sid => sid !== id));
      toast.success("Serviço removido");
    } catch (error) {
      toast.error("Erro ao remover serviço.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome) return toast.error("Busque um hóspede primeiro.");
    if (!formData.quartoId) return toast.error("Selecione um quarto.");

    const cpfApenasNumeros = formData.cpf.replace(/\D/g, '');

    const payload: CriarHospedagemRequest = {
      reservaId: formData.reservaId ? Number(formData.reservaId) : null,
      quartoId: Number(formData.quartoId),
      clienteCpf: cpfApenasNumeros,
      dataEntrada: formData.dataEntrada,
      dataSaida: formData.dataSaida,
      pagamento: {
        metodoPagamento: formData.metodoPagamento,
        status: 'CONCLUIDO',
        valorTotal: valorTotalFinal,
        dataPagamento: new Date().toISOString()
      },
      servicosAdicionaisIds: selectedServices
    };
    console.log("Payload enviado para backend: ", payload);

    try {
      await createHospedagem(payload);
      toast.success("Hospedagem iniciada com sucesso!");
      navigate('/home/reservas'); 
    } catch (error) {
      console.log("Erro ao salvar hospedagem", error);
      toast.error("Erro ao salvar hospedagem.");
    }
  };

  const isQuartoDisabled = isFromReservation || !formData.dataEntrada || !formData.dataSaida;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>{isFromReservation ? 'Check-in de Reserva' : 'Nova Hospedagem Avulsa'}</h1>
          {isFromReservation && <span className={styles.badgeReserva}>Reserva Ativa</span>}
        </div>
        <p className={styles.subtitle}>Gerencie o check-in e adicione serviços extras se necessário.</p>
      </header>
      
      <form onSubmit={handleSubmit} className={styles.formCard}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Dados do Hóspede</h3>
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>CPF do Cliente</label>
              <div className={styles.inputWrapper}>
                <input 
                  type="text" 
                  value={formData.cpf} 
                  disabled={isFromReservation}
                  onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                  placeholder="000.000.000-00"
                  required
                />
                {!isFromReservation && (
                  <>
                    <button type="button" className={styles.searchBtn} onClick={handleBuscarCliente} disabled={loadingSearch}>
                      <Search size={16} />
                    </button>
                    <button type="button" className={styles.addClientBtn} onClick={() => navigate('/cadastro')}>
                      <UserPlus size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label>Nome Completo</label>
              <input type="text" value={formData.nome} disabled placeholder="Identifique o cliente..." />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Informações da Estadia</h3>
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Data de Entrada</label>
              <input 
                type="date" 
                value={formData.dataEntrada} 
                onChange={(e) => setFormData({...formData, dataEntrada: e.target.value})}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Data de Saída</label>
              <input 
                type="date" 
                value={formData.dataSaida} 
                onChange={(e) => setFormData({...formData, dataSaida: e.target.value})}
                required
              />
            </div>
          </div>

          <div className={styles.row} style={{marginTop: '1.5rem'}}>
            <div className={styles.inputGroup}>
              <label>Quarto</label>
              <select 
                value={formData.quartoId} 
                disabled={isQuartoDisabled || loadingQuartos}
                onChange={(e) => setFormData({...formData, quartoId: e.target.value})}
                required
              >
                {loadingQuartos ? (
                  <option>Buscando quartos...</option>
                ) : (
                  <>
                    <option value="">Selecione um quarto...</option>
                    {isFromReservation && (
                       <option value={formData.quartoId}>Quarto Reservado (ID: {formData.quartoId})</option>
                    )}
                    {quartosDisponiveis.map(q => (
                      <option key={q.id} value={q.id}>
                        Quarto {q.numero} - {q.tipo || 'Comum'} (R$ {q.preco?.toFixed(2) || '0.00'})
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>ID da Reserva</label>
              <input type="text" value={formData.reservaId || "Sem reserva prévia"} disabled />
            </div>
          </div>
        </section>

        {/* SEÇÃO DE SERVIÇOS ADICIONAIS */}
        <section className={styles.section}>
          <div className={styles.labelWithAction}>
            <h3 className={styles.sectionTitle}>Serviços Adicionais</h3>
            <button type="button" className={styles.textActionBtn} onClick={() => setIsModalOpen(true)}>
              <Plus size={14} /> Novo Serviço
            </button>
          </div>

          <div className={styles.customSelectContainer} ref={dropdownRef}>
            <div 
              className={`${styles.customSelectTrigger} ${isServiceDropdownOpen ? styles.open : ''}`}
              onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
            >
              <span>
                {selectedServices.length > 0 
                  ? `${selectedServices.length} serviço(s) selecionado(s)` 
                  : "Selecione serviços extras..."}
              </span>
              {isServiceDropdownOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>

            {isServiceDropdownOpen && (
              <div className={styles.customOptionsList}>
                {servicosDisponiveis.map(serv => (
                  <div key={serv.id} className={styles.customOptionItem}>
                    <label className={styles.optionCheckboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={selectedServices.includes(serv.id!)}
                        onChange={() => {
                          setSelectedServices(prev => 
                            prev.includes(serv.id!) ? prev.filter(id => id !== serv.id) : [...prev, serv.id!]
                          );
                        }}
                      />
                      <span className={styles.optionText}>
                        {serv.nomeServico} <strong>(R$ {serv.preco.toFixed(2)})</strong>
                      </span>
                    </label>
                    <div className={styles.optionActions}>
                      <button type="button" className={styles.editIcon} title="Editar" onClick={(e) => {
                        e.stopPropagation();
                        setServiceToEdit(serv);
                        setIsModalOpen(true);
                      }}>
                        <Edit2 size={14} />
                      </button>
                      <button type="button" className={styles.deleteIcon} title="Excluir" onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteService(serv.id!);
                      }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {servicosDisponiveis.length === 0 && (
                  <div className={styles.emptyOptions}>Nenhum serviço cadastrado.</div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Pagamento</h3>
          
          {/* Adicionado um Resumo para o Usuário entender a conta */}
          <div className={styles.invoiceSummary}>
             <p>{noites} diárias x R$ {precoDiaria.toFixed(2)} = <span>R$ {valorHospedagem.toFixed(2)}</span></p>
             <p>Serviços Extras = <span>R$ {totalServicos.toFixed(2)}</span></p>
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Método de Pagamento</label>
              <select 
                value={formData.metodoPagamento}
                onChange={(e) => setFormData({...formData, metodoPagamento: e.target.value})}
                required
              >
                <option value="">Selecione...</option>
                <option value="PIX">PIX</option>
                <option value="DINHEIRO">Dinheiro</option>
                <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                <option value="CARTAO_DEBITO">Cartão de Débito</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Valor Total (Estadia + Extras)</label>
              <div className={styles.priceTotalHighlight}>
                <span>R$</span>
                <input 
                  type="text" 
                  value={valorTotalFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} 
                  disabled 
                />
              </div>
            </div>
          </div>
        </section>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Voltar
          </button>
          <button type="submit" className={styles.confirmBtn}>
            <CheckCircle size={18} /> Finalizar Hospedagem
          </button>
        </div>
      </form>

      {(isModalOpen || serviceToEdit) && (
        <AdditionalServiceModal 
          initialData={serviceToEdit}
          onClose={() => { setIsModalOpen(false); setServiceToEdit(null); }}
          onSave={handleSaveService}
        />
      )}
    </div>
  );
};

export default HospedagemFormPage;