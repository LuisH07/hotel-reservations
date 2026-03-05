import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

interface TokenPayload {
  role: string;
  exp: number;
}

const getValidTokenPayload = (token: string | null): TokenPayload | null => {
  if (!token) return null;
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (decoded.exp < currentTime) return null;
    return decoded;
  } catch {
    return null;
  }
};

const ProtectedRoute = ({ allowedRole }: { allowedRole: string }) => {
  const token = localStorage.getItem('token');
  
  const payload = getValidTokenPayload(token);

  if (!payload || payload.role !== allowedRole) {
    toast.error("Usuário não autorizado!")
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;