import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Github, Globe, Hotel } from 'lucide-react';
import styles from './Layout.module.css';
import { getUserRole } from '../../services/authService';
import profileIcon from '../../assets/foto-do-perfil.svg';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const userRole = getUserRole();
  const isManager = userRole === 'FUNCIONARIO';

  useEffect(() => {
    if (!userRole) {
      navigate('/');
    }
  }, [userRole, navigate]);

  if (!userRole) return null;

  return (
    <div className={styles.container}>
      
      {/* --- HEADER --- */}
      <header className={styles.header}>
        
        <Link to="/home" className={styles.logoLink}>
        {/* Logo */}
          <div className={styles.logoIconWrapper}>
            <Hotel size={40} className="text-[#1e293b]" strokeWidth={1.5} />
          </div>

          <div className={styles.logoTextWrapper}>
            <span className={styles.logoTitle}>
              Horizon
            </span>
            <span className={styles.logoSubtitle}>
              Hotel & Resort
            </span>
          </div>
        </Link>
        
        {/* Navigation */}
        <nav className={styles.navContainer}>
          <Link 
            to="/home/reservas" 
            className={styles.navLink}
          >
          Reservas
          </Link>

          {isManager && (
            <Link 
              to="/home/relatorios" 
              className={styles.navLink}
            >
            Relatórios
            </Link>
          )}

          {isManager && (
            <Link 
              to="/quartos" 
              className={styles.navLink}
            >
            Quartos
            </Link>
          )}

          <Link 
            to="/perfil" 
            className={styles.navLink}
            title="Meu Perfil"
            style={{ display: 'flex', alignItems: 'center', padding: '0.5rem' }}
          >
            <img 
              src={profileIcon} 
              alt="Perfil" 
              style={{ width: '28px', height: '28px', borderRadius: '50%' }} 
            />
          </Link>
        </nav>
      </header>
      
      <main className={styles.main}>
        <Outlet />
      </main>

      {/* --- FOOTER --- */}
      <footer className={styles.footer}>
        {/* Parte Superior: Logo e Link Github */}
        <div className={styles.footerTop}>
          
          {/* Lado Esquerdo: Logo e Slogan */}
          <div className={styles.footerLeft}>
            <div className={styles.footerLogoGroup}>
              <div className={styles.footerIconWrapper}>
                <Hotel size={40} className="text-white" strokeWidth={1.5} />
              </div>
              <div className={styles.logoTextWrapper}>
                <span className={styles.footerLogoTitle}>
                  Horizon
                </span>
                <span className={styles.footerLogoSubtitle}>
                  Hotel & Resort
                </span>
              </div>
            </div>
            <p className={styles.footerSlogan}>
              Experiência de luxo e conforto em cada detalhe da sua estadia.
            </p>
          </div>

          {/* Lado Direito: Github Maior */}
          <div className={styles.footerRight}>
            <a 
              href="https://github.com/LuisH07/hotel-reservations" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.githubLink}
              title="GitHub"
            >
              <Github size={40} />
              <span className={styles.githubText}>GITHUB</span>
            </a>
          </div>
        </div>

        {/* Parte Inferior: Copyright (Menos espaço superior) */}
        <div className={styles.footerBottom}>
          <p>© 2026 Horizon Hotel Group. Todos os direitos reservados.</p>
          
          <div className={styles.footerBottomRight}>
            <div className={styles.languageSelector}>
              <Globe size={14} />
              <span>Português (BR)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;