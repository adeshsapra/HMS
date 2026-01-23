import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Preloader from './Preloader';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <Preloader />;
    }

    if (!isAuthenticated) {
        // Redirect to sign-in but save the location they were trying to go to
        return <Navigate to="/sign-in" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
