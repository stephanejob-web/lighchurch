import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center text-white">Chargement...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Ou page 403
        return <Navigate to="/dashboard" replace />;
    }

    // New check: if user is pending and not super admin, show "Waiting" page ? 
    // For now let's allow access to dashboard but maybe restrict features or show banner

    return <Outlet />;
}
