import ProtectedRoute from "../routes/ProtectedRoute";

import Landing from "../pages/Landing";
import Template from "../pages/Template";
import CreateTicket from "../pages/CreateTicket";

import Dashboard from "../pages/Dashboard";
import AdminDashboard from "../pages/AdminDashboard";

import TicketCard from "../components/TicketCard";
import TicketPage from "../pages/TicketPage";
import FaqPage from "../pages/FaqPage";
import ChatPage from "../pages/ChatPage";

import { Navigate } from "react-router-dom";

const routes = [
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/classidesk",
    element: (
      <ProtectedRoute allowedRoles={["user", "admin"]}>
        <Template />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <Navigate to="dashboard" />,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute allowedRoles={["user"]}>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "create-ticket",
        element: (
          <ProtectedRoute allowedRoles={["user"]}>
            <CreateTicket />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "ticket/:id",
        element: (
          <ProtectedRoute allowedRoles={["user", "admin"]}>
            <TicketPage /> 
          </ProtectedRoute>
        ),
      },
      {
        path: "faqs",
        element: (
          <ProtectedRoute allowedRoles={["user", "admin"]}>
            <FaqPage />
          </ProtectedRoute>
        ),
      },{
        path : "chat",
        element : (
          <ProtectedRoute allowedRoles={["user", "admin"]}>
            <ChatPage />
          </ProtectedRoute>
        ),
      }
      
    ],
  },
];

export default routes;
