import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./features/auth/authSlice";
import { Loader2 } from "lucide-react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./features/auth/home";
import LoginForm from "./features/auth/LoginForm";
import RegisterForm from "./features/auth/RegisterForm";
import ProtectedLayout from "./component/ProtectedLayout";
import PatientDashboard from "./features/patient/PatientDashboard";
import TherapistDashboard from "./features/therapist/TherapistDashboard";
import AdminDashboard from "./features/admin/AdminDashboard";
import NotFound from "./component/NotFound";

import PendingApproval from "./features/auth/PendingApproval";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <NotFound />,
  },
  {
    path: "/login",
    element: <LoginForm />,
  },
  {
    path: "/register",
    element: <RegisterForm />,
  },
  {
    path: "/pending-approval",
    element: <PendingApproval />,
  },

  {
    element: <ProtectedLayout allowedRole="patient" />,
    children: [
      {
        path: "/patient/dashboard",
        element: <PatientDashboard />,
      },

    ],
  },

  {
    element: <ProtectedLayout allowedRole="admin" />,
    children: [
      {
        path: "/admin/dashboard",
        element: <AdminDashboard />,
      },

    ],
  },

  {
    element: <ProtectedLayout allowedRole="therapist" />,
    children: [
      {
        path: "/therapist/dashboard",
        element: <TherapistDashboard />,
      },
    ],
  },


]);

function App() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4 text-emerald-600">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="font-medium text-gray-500">Loading your session...</p>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default App;