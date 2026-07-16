import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./features/auth/Home";
import LoginForm from "./features/auth/LoginForm";
import RegisterForm from "./features/auth/RegisterForm";
import ProtectedLayout from "./component/ProtectedLayout";
import PatientDashboard from "./features/patient/PatientDashboard";
import TherapistDashboard from "./features/therapist/TherapistDashboard";
import NotFound from "./component/NotFound";

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
        path: "/patient/dashboard",
        element: <PatientDashboard />,
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