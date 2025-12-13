import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { LandingPage } from "./components/LandingPage";
import { UnifiedLoginPage } from "./components/UnifiedLoginPage";
import { UnifiedRegisterPage } from "./components/UnifiedRegisterPage";

import { InfoPage } from "./components/InfoPage";
import { ServicesPage } from "./components/ServicesPage";
import { AdminPage } from "./components/AdminPage";
import { HomeMedico } from "./components/HomeMedico";
import { HomePaciente } from "./components/HomePaciente";
import { ProfileMedico } from "./components/ProfileMedico";
import { ProfilePaciente } from "./components/ProfilePaciente";
import { ProfileAdmin } from "./components/ProfileAdmin";
import { DoctorScheduleManagement } from "./components/DoctorScheduleManagement";
import { DoctorAppointments } from "./components/DoctorAppointments";
import { DoctorSearch } from "./components/DoctorSearch";
import { AppointmentBooking } from "./components/AppointmentBooking";
import { PatientAppointments } from "./components/PatientAppointments";
import { NotificationsPage } from "./components/NotificationsPage";
import { VideollamadaPage } from "./components/VideollamadaPage";
import { ChatPage } from "./components/ChatPage";
import { PatientMedicalHistory } from "./components/PatientMedicalHistory";
import { ChatWidget } from "./components/ChatWidget";


import { AuthProvider, useAuth } from "./context/AuthContext";
import { useState, useEffect } from "react";

// Wrapper to handle conditional Header/Footer visibility and prop passing adapter
function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading, login } = useAuth();

  // Adapter for old onNavigate prop until components are refactored
  const handleNavigate = (page: string) => {
    switch (page) {
      case "landing": navigate("/"); break;
      case "login": navigate("/login"); break;
      case "register": navigate("/register"); break;
      case "dashboard": navigate("/admin/dashboard"); break;
      case "home-medico": navigate("/medico/home"); break;
      case "home-paciente": navigate("/paciente/home"); break;

      case "info": navigate("/info"); break;
      case "servicios": navigate("/servicios"); break;
      case "notificaciones":
        if (user?.role === "medico") {
          navigate("/medico/notificaciones");
        } else if (user?.role === "paciente") {
          navigate("/paciente/notificaciones");
        }
        break;
      case "profile":
        if (user?.role === "administrador") {
          navigate("/admin/profile");
        } else if (user?.role === "medico") {
          navigate("/medico/profile");
        } else {
          navigate("/paciente/profile");
        }
        break;
      case "citas": navigate("/paciente/doctors"); break;
      case "mis-citas": navigate("/paciente/appointments"); break;
      case "historial": navigate("/paciente/historial"); break;
      case "videollamada":
        if (user?.role === "medico") {
          navigate("/medico/videollamada");
        } else {
          navigate("/paciente/videollamada");
        }
        break;
      case "chat":
        if (user?.role === "medico") {
          navigate("/medico/chat");
        } else {
          navigate("/paciente/chat");
        }
        break;
      default: navigate("/");
    }
  };

  const handleLogin = (type: "medico" | "paciente" | "administrador") => {
    // Redirigir según el rol del usuario
    if (user?.role === "administrador" || type === "administrador") {
      navigate("/admin/dashboard");
    } else if (type === "medico" || user?.role === "medico") {
      navigate("/medico/home");
    } else if (type === "paciente" || user?.role === "paciente") {
      navigate("/paciente/home");
    } else {
      // Fallback: redirigir según el tipo de login
      navigate(type === "medico" ? "/medico/home" : type === "administrador" ? "/admin/dashboard" : "/paciente/home");
    }
  };

  const handleRegister = (type: "medico" | "paciente") => {
    // Después del registro, redirigir al home correspondiente
    navigate(type === "medico" ? "/medico/home" : "/paciente/home");
  };

  const handleLogout = () => {
    navigate("/");
  };

  const showHeaderFooter = true;

  const currentPageMap: Record<string, string> = {
    "/": "landing",
    "/login": "login",
    "/register": "register",
    "/medico/home": "home-medico",
    "/paciente/home": "home-paciente",
    "/info": "info",
    "/servicios": "servicios",
    "/admin/dashboard": "dashboard",
    "/admin/profile": "profile",
    "/medico/profile": "profile",
    "/paciente/profile": "profile"
  };

  const currentPage = currentPageMap[location.pathname] || "landing";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">

      {showHeaderFooter && (
        <Header onNavigate={handleNavigate} currentPage={currentPage} />
      )}

      <Routes>
        <Route path="/" element={<LandingPage onNavigate={handleNavigate} />} />

        {/* Rutas Unificadas (Nuevas) */}
        <Route path="/login" element={
          isAuthenticated ? (
            <Navigate to={
              user?.role === "administrador" ? "/admin/dashboard" :
                user?.role === "medico" ? "/medico/home" :
                  "/paciente/home"
            } replace />
          ) : (
            <UnifiedLoginPage
              onLogin={async (email, password, role) => {
                // Importar authService
                const { authService } = await import("./services/auth.service");
                const response = await authService.login(email, password);

                // Actualizar el contexto de autenticación
                login(response.token, response.user);

                // Redirigir según el rol real del usuario (no el seleccionado)
                handleLogin(response.user.role);
              }}
              onNavigate={handleNavigate}
            />
          )
        } />

        <Route path="/register" element={
          isAuthenticated ? (
            <Navigate to={
              user?.role === "administrador" ? "/admin/dashboard" :
                user?.role === "medico" ? "/medico/home" :
                  "/paciente/home"
            } replace />
          ) : (
            <UnifiedRegisterPage
              onRegister={async (data, role) => {
                // Importar authService
                const { authService } = await import("./services/auth.service");
                const response = await authService.register(data);

                // Verificar si tenemos el URL de previsualización (usando cast 'any' porque la estructura real difiere de la interfaz actual)
                const responseData = response as any;
                const emailUrl = responseData?.data?.emailPreviewUrl || responseData?.emailPreviewUrl || responseData?.data?.data?.emailPreviewUrl;

                if (emailUrl) {
                  // Toast de éxito con botón para abrir el email
                  toast.success(
                    `✅ Registro exitoso! Email enviado. Haz clic en "Ver Email" para confirmar.`,
                    {
                      duration: 60000, // 1 minuto, tiempo suficiente para leer
                      action: {
                        label: "Ver Email",
                        onClick: () => window.open(emailUrl, '_blank')
                      }
                    }
                  );
                } else {
                  // Mensaje genérico si no hay URL (producción o caso normal sin Ethereal)
                  toast.success("✅ Registro exitoso! Revisa tu email para verificar tu cuenta.", {
                    duration: 60000,
                  });
                }

                // NO redirigir - quedarse en la página de registro
                // handleRegister(role as "medico" | "paciente");
              }}
              onNavigate={handleNavigate}
            />
          )
        } />







        <Route path="/dashboard/profile" element={
          isAuthenticated && user?.role === "administrador" ? <ProfileAdmin /> : <Navigate to="/" />
        } />

        <Route path="/admin/profile" element={
          isAuthenticated && user?.role === "administrador" ? <ProfileAdmin /> : <Navigate to="/" />
        } />

        <Route path="/medico/profile" element={
          isAuthenticated && user?.role === "medico" ? <ProfileMedico /> : <Navigate to="/" />
        } />

        <Route path="/paciente/profile" element={
          isAuthenticated && user?.role === "paciente" ? <ProfilePaciente /> : <Navigate to="/" />
        } />

        <Route path="/info" element={<InfoPage />} />
        <Route path="/servicios" element={<ServicesPage />} />

        {/* Ruta de Dashboard para Admin */}
        <Route path="/admin/dashboard" element={
          isAuthenticated && user?.role === "administrador" ? (
            <AdminPage />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        <Route path="/medico/home" element={
          isAuthenticated && user?.role === "medico" ? (
            <HomeMedico onNavigate={handleNavigate} />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        <Route path="/medico/videollamada" element={
          isAuthenticated && user?.role === "medico" ? (
            <VideollamadaPage userType="medico" onNavigate={handleNavigate} />
          ) : (
            <Navigate to="/" replace />
          )
        } />
        <Route path="/medico/chat" element={
          isAuthenticated && user?.role === "medico" ? (
            <ChatPage userType="medico" onNavigate={handleNavigate} />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        <Route path="/medico/schedules" element={
          isAuthenticated && user?.role === "medico" ? (
            <DoctorScheduleManagement />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        <Route path="/medico/appointments" element={
          isAuthenticated && user?.role === "medico" ? (
            <DoctorAppointments />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        <Route path="/medico/notificaciones" element={
          isAuthenticated && user?.role === "medico" ? (
            <NotificationsPage />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        <Route path="/paciente/notificaciones" element={
          isAuthenticated && user?.role === "paciente" ? (
            <NotificationsPage />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        <Route path="/paciente/home" element={
          isAuthenticated && user?.role === "paciente" ? (
            <HomePaciente onNavigate={handleNavigate} />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        <Route path="/paciente/videollamada" element={
          isAuthenticated && user?.role === "paciente" ? (
            <VideollamadaPage userType="paciente" onNavigate={handleNavigate} />
          ) : (
            <Navigate to="/" replace />
          )
        } />
        <Route path="/paciente/chat" element={
          isAuthenticated && user?.role === "paciente" ? (
            <ChatPage userType="paciente" onNavigate={handleNavigate} />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        <Route path="/paciente/doctors" element={
          isAuthenticated && user?.role === "paciente" ? (
            <DoctorSearch />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        <Route path="/paciente/book-appointment/:doctorId" element={
          isAuthenticated && user?.role === "paciente" ? (
            <AppointmentBooking />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        <Route path="/paciente/appointments" element={
          isAuthenticated && user?.role === "paciente" ? (
            <PatientAppointments />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        <Route path="/paciente/historial" element={
          isAuthenticated && user?.role === "paciente" ? (
            <PatientMedicalHistory />
          ) : (
            <Navigate to="/" replace />
          )
        } />
      </Routes>



      {showHeaderFooter && <Footer variant={location.pathname === "/" ? "full" : "simple"} />}
      <ChatWidget />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
      <Toaster richColors closeButton position="top-right" duration={4000} />
    </Router>
  );
}
