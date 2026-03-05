import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import MainLayout from './components/layout/layout';
import Home from './pages/HomePage';
import MinhasReservasPage from './pages/MinhasReservasPage';
import EditReservationPage from './pages/EditReservationPage';
import LoginPage from './pages/LoginPage';
import CadastroPage from './pages/CadastroPage';
import RoomPage from './pages/RoomPage';
import ReservationConfirm from './components/reservations/ReservationConfirm';
import RelatorioPage from './pages/RelatorioPage';
import Rooms from './pages/RoomsListPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import NewRoomPage from './pages/NewRoomPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          error: {
            className: 'horizon-toast',
            duration: 5000,
            iconTheme: {
              primary: '#c53030',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        
        <Route element={<MainLayout />}>
          
          <Route path="/home" index element={<Home />} />
          
          <Route path="home/reservas" element={<MinhasReservasPage />} />

          <Route path="quarto/:id" element={<RoomPage />} />

          <Route path="reserva/confirmacao/:id" element={<ReservationConfirm />} />
          <Route path="reserva/editar/:id" element={<EditReservationPage />} />

          <Route path="home/relatorios" element={<RelatorioPage />} />

          <Route path="perfil" element={<ProfilePage />} />
          
          <Route element={<ProtectedRoute allowedRole="FUNCIONARIO" />}>
            <Route path="/quartos" element={<Rooms />} />
            
            <Route path="/quartos/novo" element={<NewRoomPage />} />
            
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;