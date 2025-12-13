import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MessageSquare,
  FileText,
  Bell,
  Search,
  Stethoscope,
  MapPin,
  Star,
  Phone,
  User,
  ChevronRight,
  Activity,
  Heart
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import appointmentsService, { Cita, Medico } from "../services/appointments.service";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { AppointmentModal } from "./AppointmentModal";
import { NotificationsWidget } from "./NotificationsWidget";

interface HomePacienteProps {
  onNavigate: (page: string) => void;
}

interface MedicoDestacado extends Medico {
  rating: number;
  consultas: number;
}

export function HomePaciente({ onNavigate }: HomePacienteProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [misCitas, setMisCitas] = useState<Cita[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [topDoctors, setTopDoctors] = useState<MedicoDestacado[]>([]);
  const [allSpecialties, setAllSpecialties] = useState<string[]>([]);

  useEffect(() => {
    const loadAll = async () => {
      await Promise.all([loadCitas(), loadDoctorsAndSpecialties()]);
    };
    loadAll();
  }, []);

  const loadCitas = async () => {
    try {
      setIsLoading(true);
      const citas = await appointmentsService.getUpcoming(50);
      setMisCitas(citas);
    } catch (error) {
      console.error("Error loading citas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDoctorsAndSpecialties = async () => {
    try {
      const doctors = await appointmentsService.searchDoctors();

      // Procesar médicos destacados
      const doctorsWithStats = doctors.map(d => ({
        ...d,
        rating: Number((4.5 + Math.random() * 0.5).toFixed(1)),
        consultas: Math.floor(Math.random() * 400) + 100
      })).sort((a, b) => b.rating - a.rating).slice(0, 3);

      setTopDoctors(doctorsWithStats);

      const specialtiesSet = new Set<string>();
      doctors.forEach(d => {
        d.especialidades.forEach(e => specialtiesSet.add(e.nombre));
      });
      if (specialtiesSet.size < 4) {
        ["Cardiología", "Dermatología", "Pediatría", "Neurología", "Medicina General"].forEach(s => specialtiesSet.add(s));
      }
      setAllSpecialties(Array.from(specialtiesSet).sort());

    } catch (error) {
      console.error("Error loading doctors:", error);
    }
  };

  const handleView = (appointmentId: number) => {
    setSelectedAppointmentId(appointmentId);
    setShowModal(true);
  };

  // Paginación
  const totalPages = Math.ceil(misCitas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCitas = misCitas.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f0f9ff] font-sans">
      {/* Header Premium con Gradiente y Curva */}
      <div className="bg-gradient-to-r from-[#0066c8] to-[#4facfe] pb-32 pt-10 rounded-b-[3rem] shadow-xl relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-10 -mb-10 blur-xl"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h1 className="text-4xl font-bold tracking-tight mb-2">Bienvenida, María</h1>
              <p className="text-blue-100 text-lg opacity-90 font-light max-w-xl">
                Tu salud es nuestra prioridad. Gestiona tus citas y consultas con facilidad.
              </p>
            </div>


          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-[-6rem] pb-12 relative z-20">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* COLUMNA IZQUIERDA (Principal) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Tarjeta de Próximas Citas */}
            <Card className="bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 border border-blue-100 overflow-hidden">
              <div className="p-8 border-b border-blue-50 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-white">
                <div>
                  <h3 className="text-xl font-bold text-[#024b85] flex items-center gap-2">
                    <Video className="h-5 w-5 text-blue-500" />
                    Mis Próximas Citas
                  </h3>
                  <p className="text-blue-600/60 text-sm mt-1">
                    Agenda de consultas programadas
                  </p>
                </div>
                <Button
                  onClick={() => onNavigate("citas")}
                  className="bg-blue-100/50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 rounded-xl"
                >
                  Nueva Cita <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50/30 hover:bg-blue-50/40 border-b border-blue-100">
                      <TableHead className="font-semibold text-blue-800">Médico</TableHead>
                      <TableHead className="font-semibold text-blue-800">Especialidad</TableHead>
                      <TableHead className="font-semibold text-blue-800">Fecha</TableHead>
                      <TableHead className="font-semibold text-blue-800">Hora</TableHead>
                      <TableHead className="font-semibold text-blue-800">Tipo</TableHead>
                      <TableHead className="font-semibold text-blue-800">Estado</TableHead>
                      <TableHead className="text-right font-semibold text-blue-800">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentCitas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-blue-400">
                          No tienes citas próximas agendadas.
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentCitas.map((cita) => (
                        <TableRow key={cita.id} className="cursor-pointer hover:bg-blue-50/30 transition-colors border-b border-blue-50/50">
                          <TableCell className="font-medium text-slate-700">
                            {cita.medico ? `Dr. ${cita.medico.primerNombre} ${cita.medico.primerApellido}` : 'N/A'}
                          </TableCell>
                          <TableCell className="text-slate-500">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                              {(cita.medico?.especialidades?.[0] as any)?.especialidad?.nombre ||
                                (cita.medico?.especialidades?.[0] as any)?.nombre ||
                                'General'}
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-600 font-medium whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <CalendarIcon className="h-3.5 w-3.5 text-blue-400" />
                              {format(new Date(cita.inicio), "dd MMM yyyy", { locale: es })}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-blue-400" />
                              {format(new Date(cita.inicio), "hh:mm a", { locale: es })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-none font-normal">
                              <Video className="h-3 w-3 mr-1" />
                              Virtual
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`
                                ${cita.estadoCita?.codigo === "confirmada" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}
                                border-none font-medium px-2.5 py-0.5
                              `}
                            >
                              {cita.estadoCita?.nombre || "Pendiente"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              className="bg-[#0066c8] hover:bg-[#0052a3] text-white font-bold rounded-lg px-6 h-8 shadow-sm transition-all hover:shadow-md active:scale-95"
                              onClick={() => handleView(cita.id)}
                            >
                              Ver
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Paginador */}
              {misCitas.length > 0 && (
                <div className="p-4 border-t border-blue-100 bg-blue-50/20 flex items-center justify-between text-sm">
                  <div className="text-blue-600/70">
                    Mostrando {Math.min(misCitas.length, itemsPerPage)} de {misCitas.length} citas
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0">‹</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 w-8 p-0">›</Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Médicos Destacados */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white rounded-[2rem] shadow-lg shadow-blue-900/5 p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-[#024b85] mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                  Médicos Recomendados
                </h3>
                <div className="space-y-4">
                  {topDoctors.map((medico) => (
                    <div key={medico.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-blue-50/50 transition-colors border border-transparent hover:border-blue-100 cursor-pointer group" onClick={() => onNavigate("citas")}>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 truncate text-sm">Dr. {medico.primerNombre} {medico.primerApellido}</h4>
                        <p className="text-xs text-blue-500 font-medium">{medico.especialidades[0]?.nombre || "General"}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-bold text-slate-600">{medico.rating}</span>
                          <span className="text-xs text-slate-400">({medico.consultas} consult.)</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-blue-300 group-hover:text-blue-500" />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-white rounded-[2rem] shadow-lg shadow-blue-900/5 p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-[#024b85] mb-4 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-emerald-500" />
                  Especialidades Top
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allSpecialties.map((esp, i) => (
                    <span key={i} className="px-3 py-1.5 bg-blue-50/80 text-blue-700 text-sm font-medium rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors cursor-default">
                      {esp}
                    </span>
                  ))}
                </div>
              </Card>
            </div>

          </div>

          {/* COLUMNA DERECHA (Sidebar) */}
          <div className="space-y-6">

            {/* Accesos Rápidos - Estilo Premium */}
            <Card className="bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 p-6 border border-blue-100">
              <h3 className="text-lg font-bold text-[#024b85] mb-6">Accesos Rápidos</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => onNavigate("citas")}
                  className="w-full justify-start h-auto py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 group transition-all hover:scale-[1.02]"
                >
                  <div className="bg-white/20 p-2 rounded-lg mr-3 group-hover:bg-white/30 transition-colors">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold">Agendar Nueva Cita</span>
                    <span className="text-xs text-blue-100 font-normal">Encuentra tu especialista</span>
                  </div>
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => onNavigate("mis-citas")} variant="outline" className="h-auto py-3 flex-col gap-2 rounded-xl border-blue-100 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-600 bg-slate-50/50">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span className="text-xs font-semibold">Mis Citas</span>
                  </Button>
                  <Button onClick={() => onNavigate("historial")} variant="outline" className="h-auto py-3 flex-col gap-2 rounded-xl border-blue-100 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-600 bg-slate-50/50">
                    <FileText className="h-5 w-5 text-indigo-500" />
                    <span className="text-xs font-semibold">Historial</span>
                  </Button>
                  <Button onClick={() => onNavigate("videollamada")} variant="outline" className="h-auto py-3 flex-col gap-2 rounded-xl border-blue-100 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-600 bg-slate-50/50">
                    <Video className="h-5 w-5 text-emerald-500" />
                    <span className="text-xs font-semibold">Video</span>
                  </Button>
                  <Button onClick={() => onNavigate("chat")} variant="outline" className="h-auto py-3 flex-col gap-2 rounded-xl border-blue-100 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-600 bg-slate-50/50">
                    <MessageSquare className="h-5 w-5 text-amber-500" />
                    <span className="text-xs font-semibold">Chat</span>
                  </Button>
                </div>
              </div>
            </Card>

            {/* Calendario Widget */}
            <Card className="bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 p-6 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#024b85]">Calendario</h3>
                <Badge variant="outline" className="text-xs border-blue-200 text-blue-600 bg-blue-50">Hoy</Badge>
              </div>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-xl border border-blue-100 bg-white"
                />
              </div>
            </Card>

            {/* Notificaciones */}
            <NotificationsWidget />

          </div>

        </div>
      </div>

      {/* Modal de Detalles de Cita */}
      <AppointmentModal
        appointmentId={selectedAppointmentId}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedAppointmentId(null);
        }}
        mode="view"
        onSuccess={loadCitas}
      />
    </div>
  );
}
