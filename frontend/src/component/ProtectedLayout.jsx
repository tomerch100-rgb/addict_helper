import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './Navbar';
import Footer from './Footer';

function ProtectedLayout({ allowedRole }) {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const user = useSelector((state) => state.auth.user)


    if (!isAuthenticated || user.role !== allowedRole) {
        return <Navigate to="/login" replace />;
    }


    return (
        <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default ProtectedLayout;