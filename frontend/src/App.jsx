import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./features/auth/home";
import LoginForm from "./features/auth/LoginForm";
import RegisterForm from "./features/auth/RegisterForm";
import ProtectedLayout from "./component/ProtectedLayout";
import PatientDashboard from "./features/patient/PatientDashboard";
import TherapistDashboard from "./features/therapist/TherapistDashboard";
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
        element: <PatientDashboard />,
        path: "/admin/dashboard",
        element: <div>Admin Dashboard</div>,
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
  return <RouterProvider router={router} />;
}

export default App;