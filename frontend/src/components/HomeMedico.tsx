import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Video,
  MessageSquare,
  User,
  Bell,
  TrendingUp,
  ClipboardList,
  Activity,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { NotificationsWidget } from "./NotificationsWidget";
import { ScheduleViewer } from "./ScheduleViewer";
import appointmentsService, { Cita } from "../services/appointments.service";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface HomeMedicoProps {
  onNavigate: (page: string) => void;
}

export function HomeMedico({ onNavigate }: HomeMedicoProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [citasHoy, setCitasHoy] = useState<Cita[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [stats, setStats] = useState({
    citasHoy: 0,
    pacientesAtendidos: 0,
    consultasPendientes: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      const today = await appointmentsService.getToday();
      setCitasHoy(today);

      const past = await appointmentsService.getHistory(1000);
      const completadas = past.filter((c: Cita) =>
        c.estadoCitaId === 4
      ).length;

      const upcoming = await appointmentsService.getUpcoming(50);
      const startOfTomorrow = new Date();
      startOfTomorrow.setHours(0, 0, 0, 0);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

      const futuras = upcoming.filter(c =>
        new Date(c.inicio) >= startOfTomorrow
      ).length;

      setStats({
        citasHoy: today.length,
        pacientesAtendidos: completadas,
        consultasPendientes: futuras,
      });
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const indexOfLastCita = currentPage * itemsPerPage;
  const indexOfFirstCita = indexOfLastCita - itemsPerPage;
  const currentCitas = citasHoy.slice(indexOfFirstCita, indexOfLastCita);
  const totalPages = Math.ceil(citasHoy.length / itemsPerPage);

  const handleViewCita = (cita: Cita) => {
    setSelectedCita(cita);
    setIsModalOpen(true);
  };

  const estadisticas = [
    {
      label: "Citas para Hoy",
      value: stats.citasHoy.toString(),
      change: "+2",
      icon: CalendarIcon,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Pacientes Atendidos",
      value: stats.pacientesAtendidos.toString(),
      change: "+12%",
      icon: Users,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Citas Futuras",
      value: stats.consultasPendientes.toString(),
      change: "Próx. Semana",
      icon: ClipboardList,
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: "Valoración",
      value: "4.9",
      change: "+0.1",
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f0f9ff] pb-20 font-sans">
      {/* Header Estilizado con Gradiente de Marca - IDÉNTICO AL ADMIN */}
      <div className="bg-gradient-to-r from-[#0066c8] to-[#4facfe] text-white pt-10 pb-28 px-6 rounded-b-[50px] shadow-xl shadow-blue-900/10 mb-[-80px] relative z-0">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-3 tracking-tight">Panel Médico</h1>
              <p className="opacity-90 text-lg font-medium max-w-2xl">
                Bienvenido, Dr. García. Gestiona tu agenda, pacientes y consultas del día.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Estadísticas - Grid flotante IDÉNTICO AL ADMIN */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {estadisticas.map((stat, index) => (
            <div key={index} className="bg-gradient-to-br from-white via-blue-50/60 to-blue-100/40 rounded-[2rem] p-6 shadow-xl shadow-blue-900/5 border border-blue-100/80 hover:border-blue-300 hover:shadow-blue-100 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              {/* Decoración de fondo */}
              <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-[0.03] ${stat.color.split(' ')[0].replace('bg-', 'bg-')} blur-2xl transition-all group-hover:opacity-10`}></div>

              <div className="flex items-center justify-between mb-6 relative">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white shadow-sm group-hover:scale-110 transition-transform duration-300 ring-4 ring-white/50 border border-blue-50`}>
                  <stat.icon className={`h-7 w-7 ${stat.color.replace('bg-', 'text-').replace('100', '600')}`} />
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1 shadow-sm bg-white ${stat.change.includes('+') ? 'text-emerald-700 border-emerald-100' : 'text-slate-600 border-slate-100'}`}>
                  {stat.change.includes('+') ? <Activity className="w-3 h-3" /> : null}
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

        {/* Contenido Principal Grid */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Columna Izquierda - Citas y Agenda */}
          <div className="lg:col-span-2 space-y-10">

            {/* Próximas Citas */}
            <div className="bg-white rounded-[2rem] shadow-lg shadow-slate-200/40 border-2 border-slate-100 overflow-hidden relative group hover:border-blue-100 transition-colors">
              {/* Banda superior decorativa IDÉNTICA */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>

              <div className="p-1">
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50">
                  <div>
                    <h3 className="text-xl font-bold text-[#024b85] flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-blue-500" />
                      Citas del Día
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">Próximas consultas programadas.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/80">
                      <TableRow className="border-b border-slate-100">
                        <TableHead className="py-4 pl-6 font-semibold text-[#024b85]">Paciente</TableHead>
                        <TableHead className="py-4 font-semibold text-[#024b85]">Hora</TableHead>
                        <TableHead className="py-4 font-semibold text-[#024b85]">Tipo</TableHead>
                        <TableHead className="py-4 font-semibold text-[#024b85]">Estado</TableHead>
                        <TableHead className="py-4 pr-6 text-right font-semibold text-[#024b85]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                            <div className="flex justify-center mb-2"><Activity className="animate-spin h-6 w-6 text-blue-400" /></div>
                            Cargando...
                          </TableCell>
                        </TableRow>
                      ) : citasHoy.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-16 text-slate-400">
                            <p>No tienes citas hoy.</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentCitas.map((cita) => (
                          <TableRow key={cita.id} className="hover:bg-blue-50/30 transition-colors border-b border-slate-50">
                            <TableCell className="pl-6 py-4 font-medium text-slate-700">
                              {cita.paciente?.primerNombre} {cita.paciente?.primerApellido}
                            </TableCell>
                            <TableCell className="py-4 text-slate-600 font-medium bg-blue-50/30 rounded-lg">
                              {format(new Date(cita.inicio), "hh:mm a", { locale: es })}
                            </TableCell>
                            <TableCell className="py-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                <Video className="h-3 w-3" /> Videollamada
                              </span>
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge className={`rounded-lg px-2.5 py-1 font-medium border-0 ${cita.estadoCita?.codigo === "confirmada"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                                }`}>
                                {cita.estadoCita?.nombre || "Pendiente"}
                              </Badge>
                            </TableCell>
                            <TableCell className="pr-6 py-4 text-right">
                              <Button size="sm" className="bg-[#0066c8] hover:bg-[#0055a6] text-white shadow-sm rounded-lg h-9 px-4 font-medium" onClick={() => handleViewCita(cita)}>
                                Ver Detalle
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginación */}
                {citasHoy.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-2 px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">Mostrar:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="bg-slate-50 border border-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 py-1 px-2 text-slate-600 font-medium cursor-pointer"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-sm text-slate-500 mr-3">
                        {currentPage} de {totalPages || 1}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="h-8 w-8 p-0 rounded-full hover:bg-slate-100 text-slate-500">
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="h-8 w-8 p-0 rounded-full hover:bg-slate-100 text-slate-500">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="h-8 w-8 p-0 rounded-full hover:bg-slate-100 text-slate-500">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="h-8 w-8 p-0 rounded-full hover:bg-slate-100 text-slate-500">
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Agenda */}
            <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden p-1">
              <div className="p-6 md:p-8">
                <h3 className="text-xl font-bold text-[#024b85] mb-6 border-l-4 border-[#0a8de7] pl-3">
                  Mi Agenda Semanal
                </h3>
                <ScheduleViewer />
              </div>
            </div>

          </div>

          {/* Columna Derecha - Sidebar Premium */}
          <div className="space-y-8">

            {/* Accesos Rápidos Premium */}
            <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-[2rem] p-6 shadow-lg shadow-blue-900/5 border border-blue-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full opacity-20 -mr-8 -mt-8 blur-2xl"></div>

              <h3 className="text-lg font-bold text-[#024b85] mb-6 flex items-center gap-2 relative z-10">
                <ClipboardList className="h-5 w-5 text-blue-500" />
                Accesos Rápidos
              </h3>

              <div className="space-y-3 relative z-10">
                {[
                  { label: "Gestionar Horarios", url: '/medico/schedules', icon: CalendarIcon, color: "text-blue-500", bg: "bg-blue-50" },
                  { label: "Mis Citas", url: '/medico/appointments', icon: ClipboardList, color: "text-purple-500", bg: "bg-purple-50" },
                  { label: "Notificaciones", action: () => onNavigate("notificaciones"), icon: Bell, color: "text-orange-500", bg: "bg-orange-50" },
                  { label: "Videollamada", action: () => onNavigate("videollamada"), icon: Video, color: "text-emerald-500", bg: "bg-emerald-50" },
                  { label: "Mensajes", action: () => onNavigate("chat"), icon: MessageSquare, color: "text-indigo-500", bg: "bg-indigo-50" }
                ].map((item, i) => (
                  <Button
                    key={i}
                    onClick={() => item.action ? item.action() : window.location.href = item.url || '#'}
                    variant="outline"
                    className="w-full justify-start h-14 bg-white hover:bg-white hover:translate-x-1 hover:shadow-md border-slate-100 text-slate-600 font-medium transition-all shadow-sm rounded-xl group"
                  >
                    <div className={`h-9 w-9 rounded-lg ${item.bg} flex items-center justify-center mr-3 group-hover:scale-110 transition-transform`}>
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Calendario Estilizado */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-[#024b85] mb-4 pl-2">Calendario</h3>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-xl border-0 flex justify-center w-full"
              />
            </div>

            {/* Notificaciones */}
            <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
              <NotificationsWidget />
            </div>

          </div>
        </div>
      </div>

      {/* Modal PremiumGlass */}
      {isModalOpen && selectedCita && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl shadow-blue-900/20 border border-white/50 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            {/* Header Modal */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-bold text-[#024b85]">Detalles de Cita</h2>
                <p className="text-slate-500 text-sm">ID: #{selectedCita.id.toString().padStart(6, '0')}</p>
              </div>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-full h-10 w-10 hover:bg-slate-100 text-slate-400">✕</Button>
            </div>

            <div className="space-y-6">
              {/* Info Paciente Card */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-100">
                <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-50">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Paciente</p>
                  <p className="text-lg font-bold text-slate-800">{selectedCita.paciente?.primerNombre} {selectedCita.paciente?.primerApellido}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Fecha</p>
                  <p className="font-semibold text-slate-700 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                    {format(new Date(selectedCita.inicio), "dd MMM yyyy", { locale: es })}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Hora</p>
                  <p className="font-semibold text-slate-700 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    {format(new Date(selectedCita.inicio), "hh:mm a", { locale: es })}
                  </p>
                </div>
              </div>

              {selectedCita.motivo && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Motivo</p>
                  <p className="text-slate-700 font-medium italic">"{selectedCita.motivo}"</p>
                </div>
              )}

              <div className="pt-4 flex gap-4">
                <Button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/20 py-6 rounded-xl font-bold tracking-wide">
                  INICIAR CONSULTA
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
