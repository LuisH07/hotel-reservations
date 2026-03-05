import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserRole } from '../services/authService';
import { getMyProfile, updateMyProfile, getMyFuncionarioProfile, updateMyFuncionarioProfile, type ClienteProfile, type ClienteUpdateRequest, type FuncionarioProfile, type FuncionarioUpdateRequest } from '../services/clienteService';
import { TriangleAlert } from 'lucide-react';
import styles from './ProfilePage.module.css';

// Interface unificada para o estado do componente
interface UserProfile extends Partial<ClienteProfile>, Partial<FuncionarioProfile> {
  // Campos comuns
  userId: number;
  nome: string;
  cpf: string;
  email: string;
  
  // Campos específicos
  telefone?: string;
  dataNascimento?: string;
  cargo?: string;
  salario?: number;
  hotelNome?: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ClienteUpdateRequest>({
    nome: '',
    telefone: '',
    dataNascimento: '',
    email: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userRole = getUserRole();
        setRole(userRole);
        
        let data: UserProfile;
        
        if (userRole === 'FUNCIONARIO') {
          data = await getMyFuncionarioProfile();
        } else {
          data = await getMyProfile();
        }
        
        setProfile(data);
        
        // Inicializa form data apenas com campos editáveis (que existem em ambos ou só cliente)
        setFormData({
          nome: data.nome,
          telefone: data.telefone || '',
          dataNascimento: data.dataNascimento || '',
          email: data.email,
        });
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        setError('Não foi possível carregar os dados do perfil.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        nome: profile.nome,
        telefone: profile.telefone || '',
        dataNascimento: profile.dataNascimento || '',
        email: profile.email,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      
      let updatedProfile: UserProfile;

      if (role === 'FUNCIONARIO') {
        const updateData: FuncionarioUpdateRequest = {
          nome: formData.nome,
          email: formData.email
        };
        const result = await updateMyFuncionarioProfile(updateData);
        updatedProfile = result as unknown as UserProfile;
      } else {
        const updateData: ClienteUpdateRequest = {
          nome: formData.nome,
          telefone: formData.telefone || '',
          dataNascimento: formData.dataNascimento || '',
          email: formData.email
        };
        const result = await updateMyProfile(updateData);
        updatedProfile = result as UserProfile;
      }

      setProfile(updatedProfile);
      setIsEditing(false);
      alert('Perfil atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      alert('Erro ao atualizar perfil. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.container}>Carregando...</div>;
  if (error) return <div className={styles.container}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Meu Perfil</h1>
      
      <div className={styles.card}>
        <div className={styles.infoGroup}>
          <label className={styles.label}>Nome Completo</label>
          {isEditing ? (
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={styles.input}
            />
          ) : (
            <div className={styles.value}>{profile?.nome || 'Não disponível'}</div>
          )}
        </div>

        <div className={styles.infoGroup}>
          <label className={styles.label}>CPF</label>
          <div className={`${styles.value} ${styles.readOnly}`}>{profile?.cpf || 'Não disponível'}</div>
        </div>

        {role !== 'FUNCIONARIO' && (
          <div className={styles.infoGroup}>
            <label className={styles.label}>Data de Nascimento</label>
            {isEditing ? (
              <input
                type="date"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleChange}
                className={styles.input}
              />
            ) : (
              <div className={styles.value}>
                {profile?.dataNascimento ? new Date(profile.dataNascimento).toLocaleDateString('pt-BR') : 'Não disponível'}
              </div>
            )}
          </div>
        )}

        <div className={styles.infoGroup}>
          <label className={styles.label}>E-mail</label>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
            />
          ) : (
            <div className={`${styles.value} ${styles.readOnly}`}>{profile?.email || 'Não disponível'}</div>
          )}
        </div>

        {role !== 'FUNCIONARIO' && (
          <div className={styles.infoGroup}>
            <label className={styles.label}>Telefone</label>
            {isEditing ? (
              <input
                type="text"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                className={styles.input}
              />
            ) : (
              <div className={styles.value}>{profile?.telefone || 'Não disponível'}</div>
            )}
          </div>
        )}

        <div className={styles.infoGroup}>
          <label className={styles.label}>ID do Usuário</label>
          <div className={`${styles.value} ${styles.readOnly}`}>{profile?.userId}</div>
        </div>

        <div className={styles.infoGroup}>
          <label className={styles.label}>Tipo de Conta</label>
          <div className={`${styles.value} ${styles.readOnly}`}>{role === 'FUNCIONARIO' ? 'Gerente' : 'Cliente'}</div>
        </div>

        {/* Seção específica para funcionário */}
        {role === 'FUNCIONARIO' && (
          <>
            <div className={styles.infoGroup}>
              <label className={styles.label}>Cargo</label>
              <div className={`${styles.value} ${styles.readOnly}`}>{profile?.cargo || 'Não disponível'}</div>
            </div>

            <div className={styles.infoGroup}>
              <label className={styles.label}>Hotel</label>
              <div className={`${styles.value} ${styles.readOnly}`}>{profile?.hotelNome || 'Não disponível'}</div>
            </div>

            <div className={styles.infoGroup}>
              <label className={styles.label}>Salário</label>
              <div className={`${styles.value} ${styles.readOnly}`}>
                {profile?.salario ? `R$ ${profile.salario.toFixed(2)}` : 'Não disponível'}
              </div>
            </div>
          </>
        )}

        <div className={styles.actions}>
          {isEditing ? (
            <>
              <button onClick={handleSave} className={styles.saveButton}>
                Salvar
              </button>
              <button onClick={handleCancel} className={styles.cancelButton}>
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button onClick={handleEdit} className={styles.editButton}>
                Editar
              </button>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Sair
              </button>
            </>
          )}
        </div>

        <div className={styles.infoGroup}>
          <div className={styles.noteContainer}>
            <TriangleAlert className={styles.noteIcon} size={20} />
            <p className={styles.note}>
              Caso tenha alterado seu email, saia e faça login novamente com o novo email e senha ja configurada anteriormente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
