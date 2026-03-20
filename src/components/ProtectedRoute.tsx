import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={48} className="animate-spin" color="#6366f1" />
      </div>
    );
  }

  if (!user || user.role !== 'superadmin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
};

export default ProtectedRoute;
