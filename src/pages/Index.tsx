import { useAuth } from '@/contexts/AuthContext';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';

const Index = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard /> : <LoginPage />;
};

export default Index;
