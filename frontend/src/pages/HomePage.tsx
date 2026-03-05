import { useState } from "react";
import DateInput from "../components/ui/Date";
import { Search, Loader2 } from "lucide-react";
import styles from "./HomePage.module.css";
import RoomCard from "../components/room/RoomCard";
import toast from "react-hot-toast";
import stylesHorizon from "../components/layout/Layout.module.css";

// Interface atualizada conforme seu QuartoDisponivelResponse do Backend
interface QuartoDisponivel {
  id: number;
  numero: string;
  tipo: string; // Mudado de categoriaNome para tipo
  preco: number; // Mudado de precoDiaria para preco
  image?: string; // Mudado de imageUrl para image
}

const HomePage = () => {
  const [booking, setBooking] = useState({
    checkIn: "",
    checkOut: "",
  });

  const [rooms, setRooms] = useState<QuartoDisponivel[]>([]);
  const [showCatalog, setShowCatalog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ID do hotel fixo conforme sua descoberta
  const HOTEL_ID = 1;

  const handleChange = (event: { target: { name: string; value: string } }) => {
    const { name, value } = event.target;
    setBooking((prev) => ({ ...prev, [name]: value }));
    
    if (showCatalog) setShowCatalog(false);
  };

  const handleSearch = async () => {
    const { checkIn, checkOut } = booking;

    if (!checkIn || !checkOut) {
      toast.error("Por favor, preencha as datas de entrada e saída.");
      return;
    }

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const dateIn = new Date(checkIn);
    const dateOut = new Date(checkOut);

    if (dateIn < todayDate) {
      toast.error("A data de entrada não pode ser no passado!");
      return;
    }

    if (dateOut <= dateIn) {
      toast.error("A data de saída deve ser posterior à entrada.");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Datas:", checkIn, checkOut)
      const response = await fetch(
        `http://localhost:8080/quartos/disponiveis?start=${checkIn}&end=${checkOut}&hotelId=${HOTEL_ID}`
      );

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.detail || "Falha na resposta do servidor");
      }

      const data = await response.json();
      setRooms(data);
      setShowCatalog(true);
      
      if (data.length === 0) {
        toast.error("Nenhum quarto disponível para este período.");
      }
    } catch (error) {
      console.error("Erro ao buscar quartos:", error);
      toast.error("Erro ao conectar com o servidor. Verifique se o backend está rodando.");
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={styles.homeContainer}>
      <section className={styles.heroSection}>
        <img
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="Horizon Hotel Exterior"
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay}>
          <h1 className={styles.welcomeText}>
              Bem vindo(a) ao 
              <br/>
              <div className={stylesHorizon.logoTextWrapper}>
                  <span className={styles.brandName}>
                      Horizon
                  </span>
                  <span className={styles.subtitleName}>
                      Hotel & Resort
                  </span>
              </div>
          </h1>
          
          <h3 className={styles.heroSubtitle}>
              Experiência de luxo e conforto em cada detalhe da sua estadia
          </h3>
      </div>
      </section>

      <section className={styles.searchSection}>
        <div className={styles.searchContent}>
          <h2 className={styles.title}>Período da Acomodação</h2>

          <div className={styles.formGroup}>
            <div className={styles.inputWrapper}>
              <DateInput
                label="Entrada"
                name="checkIn"
                value={booking.checkIn}
                onChange={handleChange}
                message="Data de Entrada"
                required={false}
                disabled={isLoading}
                min={today}
              />
            </div>

            <div className={styles.inputWrapper}>
              <DateInput
                label="Saída"
                name="checkOut"
                value={booking.checkOut}
                onChange={handleChange}
                message="Data de Saída"
                required={false}
                disabled={isLoading}
                min={booking.checkIn || today}
              />
            </div>

            <button 
              className={styles.searchButton} 
              aria-label="Buscar disponibilidade"
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 size={24} className={styles.spinner} />
              ) : (
                <Search size={24} strokeWidth={2.5} />
              )}
            </button>
          </div>
          
          {!showCatalog && (!booking.checkIn || !booking.checkOut) && (
            <p className={styles.helperText}>
              Digite a data para consultar os quartos disponíveis!
            </p>
          )}
        </div>
      </section>

      {showCatalog && (
        <main className={styles.catalogSection}>
          <header className={styles.catalogHeader}>
            <h1 className={styles.catalogTitle}>Catálogo de Quartos</h1>
            <p className={styles.catalogSubtitle}>
              {rooms.length > 0 
                ? `${rooms.length} acomodações encontradas` 
                : "Nenhuma acomodação disponível"}
            </p>
          </header>

          <div className={styles.roomsGrid}>
            {rooms.map((room) => (
              <RoomCard 
                key={room.id}
                id={room.id}
                type={room.tipo} 
                description={`Quarto n°${room.numero}`} 
                checkIn={booking.checkIn} 
                checkOut={booking.checkOut}
                price={`R$ ${room.preco} / noite`}
                image={room.image || "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80"}
              />
            ))}
          </div>
        </main>
      )}
      
      <div className={styles.spacer}></div>
    </div>
  );
};

export default HomePage;