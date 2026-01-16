import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from '@/components/ui';
import { AppRoutes } from '@/routes';
import { ServiceWorkerNuke } from '@/components/ServiceWorkerNuke';

function App() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = () => navigate('/login');
    window.addEventListener('medbook:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('medbook:unauthorized', handleUnauthorized);
  }, [navigate]);

  if (isLoading) {
    return <Loader fullScreen text="Loading MedBook..." />;
  }

  return (
    <>
      <ServiceWorkerNuke />
      <AppRoutes 
        isAuthenticated={isAuthenticated} 
        userRole={user?.role as 'patient' | 'doctor' | undefined} 
      />
    </>
  );
}

export default App;
