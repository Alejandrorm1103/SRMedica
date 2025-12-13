
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Users,
  User,
  Calendar,
  Activity,
  Shield,
  Database,
  Server,
  HardDrive,
  Stethoscope,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { PendingUsersPanel } from "./PendingUsersPanel";
import { UserManagementPanel } from "./UserManagementPanel";
import { AppointmentManagementPanel } from "./AppointmentManagementPanel";
import { useState, useEffect } from "react";
import { statsService, DashboardStats } from "../services/stats.service";
import { toast } from "sonner";

export function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadPendingTrigger, setReloadPendingTrigger] = useState(0);
  const [reloadActiveTrigger, setReloadActiveTrigger] = useState(0);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await statsService.getDashboardStats();
      console.log('Stats data loaded:', data);
      setStats(data);
    } catch (error: any) {
      console.error("Error loading stats:", error);
      toast.error("Error al cargar estadísticas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserActivated = () => {
    loadStats();
    setReloadActiveTrigger(prev => prev + 1);
  };

  const handleUserDeactivated = () => {
    loadStats();
    setReloadPendingTrigger(prev => prev + 1);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const statsCards = [
    {
      label: "Total Usuarios",
      value: stats?.totalUsers?.toString() ?? "...",
      icon: Users,
      change: "+12%",
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Citas Hoy",
      value: stats?.appointmentsToday?.toString() ?? "...",
      icon: Calendar,
      change: "+5%",
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Médicos Activos",
      value: stats?.activeDoctors?.toString() ?? "...",
      icon: Stethoscope,
      change: "+8%",
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Pacientes Activos",
      value: stats?.activePatients?.toString() ?? "...",
      icon: User,
      change: "+15%",
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const systemAlerts = [
    {
      id: 1,
      message: "Servicios operativos",
      time: "Uptime: 99.9%",
      icon: Server,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      id: 2,
      message: "Backup completado",
      time: "Hace 1 hora • 2.4 GB",
      icon: Database,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      id: 3,
      message: "Seguridad verificada",
      time: "Sin amenazas",
      icon: Shield,
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      id: 4,
      message: "Almacenamiento",
      time: "45% usado",
      icon: HardDrive,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f0f9ff] pb-20 font-sans">
      {/* Header Estilizado con Gradiente de Marca */}
      <div className="bg-gradient-to-r from-[#0066c8] to-[#4facfe] text-white pt-10 pb-28 px-6 rounded-b-[50px] shadow-xl shadow-blue-900/10 mb-[-80px] relative z-0">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-3 tracking-tight">Panel de Administración</h1>
              <p className="opacity-90 text-lg font-medium max-w-2xl">
                Bienvenido al centro de control de SRMedica. Gestiona usuarios, citas y monitorea la salud del sistema.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Estadísticas - Grid flotante con mayor contraste */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {statsCards.map((stat, index) => (
            <div key={index} className="bg-gradient-to-br from-white via-blue-50/60 to-blue-100/40 rounded-[2rem] p-6 shadow-xl shadow-blue-900/5 border border-blue-100/80 hover:border-blue-300 hover:shadow-blue-100 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              {/* Decoración de fondo */}
              <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-[0.03] ${stat.color.split(' ')[0]} blur-2xl transition-all group-hover:opacity-10`}></div>

              <div className="flex items-center justify-between mb-6 relative">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white shadow-sm group-hover:scale-110 transition-transform duration-300 ring-4 ring-white/50 border border-blue-50`}>
                  <stat.icon className={`h-7 w-7 ${stat.color.replace('bg-', 'text-').replace('100', '600')}`} />
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1 shadow-sm bg-white ${stat.change.startsWith('+') ? 'text-emerald-700 border-emerald-100' : 'text-rose-700 border-rose-100'}`}>
                  {stat.change.startsWith('+') ? <Activity className="w-3 h-3" /> : null}
                  {stat.change}
                </span>
              </div>
              <div className="relative">
                <p className="text-4xl font-extrabold text-slate-800 mb-1 tracking-tight">{stat.value}</p>
                <p className="text-xs font-bold text-blue-400/80 uppercase tracking-widest">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>



        {/* Paneles de Gestión */}
        <div className="space-y-10">

          {/* Usuarios Pendientes */}
          <section>
            <div className="bg-white rounded-[2rem] shadow-lg shadow-slate-200/40 border-2 border-slate-100 overflow-hidden relative group hover:border-blue-100 transition-colors">
              {/* Banda superior decorativa */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>
              <div className="p-1">
                <PendingUsersPanel onUserActivated={handleUserActivated} reloadTrigger={reloadPendingTrigger} />
              </div>
            </div>
          </section>

          {/* Gestión de Usuarios */}
          <section>
            <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
              <div className="p-1">
                <UserManagementPanel onUserDeactivated={handleUserDeactivated} reloadTrigger={reloadActiveTrigger} />
              </div>
            </div>
          </section>

          {/* Gestión de Citas */}
          <section>
            <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
              <div className="p-1">
                <AppointmentManagementPanel />
              </div>
            </div>
          </section>

          {/* Alertas del Sistema - Movido Aquí */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-[#024b85] mb-5 ml-2 border-l-4 border-[#0a8de7] pl-3">Estado del Sistema</h3>
            <div className="grid md:grid-cols-4 gap-5">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-blue-100 flex items-center gap-4 hover:shadow-md hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-default group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${alert.bgColor} border border-opacity-30 border-current group-hover:scale-105 transition-transform`}>
                    <alert.icon className={`h-6 w-6 ${alert.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{alert.message}</p>
                    <p className="text-xs text-slate-500 font-medium bg-blue-50 inline-block px-2 py-0.5 rounded-full mt-1 border border-blue-100">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analíticas */}
          <section>
            <h3 className="text-xl font-bold text-[#024b85] mb-5 ml-2 border-l-4 border-[#0a8de7] pl-3">Analíticas Detalladas</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Card 1 */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Citas por Especialidad</h3>
                <div className="space-y-5">
                  {[
                    { name: "Cardiología", value: 45, color: "bg-blue-500" },
                    { name: "Dermatología", value: 32, color: "bg-green-500" },
                    { name: "Neurología", value: 28, color: "bg-purple-500" },
                    { name: "Pediatría", value: 38, color: "bg-yellow-500" },
                    { name: "Medicina General", value: 52, color: "bg-[#0a8de7]" },
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
                        <span>{item.name}</span>
                        <span>{item.value}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className={`${item.color} h-3 rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Rendimiento del Sistema</h3>
                <div className="space-y-4">
                  {[
                    { icon: CheckCircle2, label: "Disponibilidad", sub: "Sistema operativo", val: "99.9%", color: "green" },
                    { icon: Activity, label: "Tiempo de Respuesta", sub: "Promedio", val: "124ms", color: "blue" },
                    { icon: Users, label: "Usuarios Activos", sub: "Ahora mismo", val: "347", color: "purple" }
                  ].map((item, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-5 bg-${item.color}-50 rounded-2xl border border-${item.color}-100`}>
                      <div className="flex items-center gap-4">
                        <item.icon className={`h-8 w-8 text-${item.color}-600`} />
                        <div>
                          <p className="text-sm font-bold text-gray-800">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.sub}</p>
                        </div>
                      </div>
                      <p className={`text-xl font-bold text-${item.color}-600`}>{item.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
