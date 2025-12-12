
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";
import { useState, useEffect } from "react";
import { Eye, Edit, Search, Calendar, User, CalendarX, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { toast } from "sonner";
import appointmentsService, { Cita } from "../services/appointments.service";
import { AppointmentModal } from "./AppointmentModal";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./ui/alert-dialog";

export function AppointmentManagementPanel() {
    const [appointments, setAppointments] = useState<Cita[]>([]);
    const [filteredAppointments, setFilteredAppointments] = useState<Cita[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination states
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleItemsPerPageChange = (value: number) => {
        setItemsPerPage(value);
        setCurrentPage(1);
    };

    // Modal state
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<"view" | "edit">("view");

    // Cancel state
    const [appointmentToCancel, setAppointmentToCancel] = useState<Cita | null>(null);
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    useEffect(() => {
        loadAppointments();
    }, []);

    useEffect(() => {
        filterAppointments();
    }, [searchTerm, appointments]);

    const loadAppointments = async () => {
        try {
            setIsLoading(true);
            const data = await appointmentsService.getAllAppointments();

            // Filter for active appointments (today and future)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const activeAppointments = data.filter(app => {
                const appDate = new Date(app.inicio);
                return appDate >= today;
            });

            // Sort by nearest date first
            activeAppointments.sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());

            setAppointments(activeAppointments);
        } catch (error: any) {
            console.error("Error loading appointments:", error);
            toast.error("Error al cargar las citas");
        } finally {
            setIsLoading(false);
        }
    };

    const filterAppointments = () => {
        if (!searchTerm.trim()) {
            setFilteredAppointments(appointments);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = appointments.filter((apt) => {
            const pacienteNombre = `${apt.paciente?.primerNombre} ${apt.paciente?.primerApellido}`.toLowerCase();
            const medicoNombre = `${apt.medico?.primerNombre} ${apt.medico?.primerApellido}`.toLowerCase();
            const estado = apt.estadoCita?.nombre.toLowerCase() || "";

            return (
                pacienteNombre.includes(term) ||
                medicoNombre.includes(term) ||
                estado.includes(term)
            );
        });

        setFilteredAppointments(filtered);
    };

    const handleView = (appointmentId: number) => {
        setSelectedAppointmentId(appointmentId);
        setModalMode("view");
        setShowModal(true);
    };

    const handleEdit = (appointmentId: number) => {
        setSelectedAppointmentId(appointmentId);
        setModalMode("edit");
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedAppointmentId(null);
    };

    const handleSuccess = () => {
        loadAppointments();
    };

    const handleCancelClick = (appointment: Cita) => {
        setAppointmentToCancel(appointment);
        setShowCancelDialog(true);
    };

    const executeCancel = async () => {
        if (!appointmentToCancel) return;

        try {
            setIsLoading(true);
            await appointmentsService.cancelAppointment(appointmentToCancel.id, "reprogramacion");
            toast.success("Cita cancelada exitosamente");
            loadAppointments();
        } catch (error: any) {
            console.error("Error cancelling appointment:", error);
            toast.error(error.response?.data?.error?.message || "Error al cancelar la cita");
        } finally {
            setIsLoading(false);
            setShowCancelDialog(false);
            setAppointmentToCancel(null);
        }
    };

    const getEstadoBadgeColor = (codigo?: string) => {
        switch (codigo) {
            case "programada": return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-0";
            case "confirmada": return "bg-green-100 text-green-700 hover:bg-green-200 border-0";
            case "completada": return "bg-gray-100 text-gray-700 hover:bg-gray-200 border-0";
            case "cancelada_paciente":
            case "cancelada_medico": return "bg-red-100 text-red-700 hover:bg-red-200 border-0";
            case "reprogramada": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-0";
            case "no_asistio": return "bg-orange-100 text-orange-800 hover:bg-orange-200 border-0";
            default: return "bg-gray-100 text-gray-500 hover:bg-gray-200 border-0";
        }
    };

    const renderPagination = (totalItems: number, currentPage: number, setPage: (page: any) => void) => {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (totalItems === 0) return null;

        return (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 px-1 gap-4">
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1">
                    <span className="text-sm text-gray-500">Mostrar:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="bg-transparent text-sm focus:outline-none text-gray-700 font-medium cursor-pointer"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>

                <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-500 mr-3">
                        {currentPage} de {totalPages || 1}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setPage(1)} disabled={currentPage === 1} className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setPage((prev: number) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setPage((prev: number) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages} className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 md:p-8 bg-white rounded-[2rem] shadow-sm border border-blue-50">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-slate-100 pb-6">
                <div>
                    <h3 className="text-xl font-bold text-[#024b85] mb-1 flex items-center gap-2">
                        Gestión de Citas
                        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 rounded-full px-2">
                            {filteredAppointments.length}
                        </Badge>
                    </h3>
                    <p className="text-gray-500 text-sm">
                        Administra y monitorea todas las citas médicas programadas.
                    </p>
                </div>
                {/* Buscador */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Input
                        placeholder="Buscar por paciente, médico o estado..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-gray-50 border-gray-200 rounded-xl focus:bg-white transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Tabla de Citas */}
            {isLoading ? (
                <div className="py-12 text-center flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
                    <Calendar className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                    <p>{searchTerm ? "No se encontraron citas" : "No hay citas registradas"}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <table className="w-full">
                            <thead className="bg-blue-50/80">
                                <tr className="border-b border-blue-100">
                                    <th className="text-left py-4 pl-6 pr-4 text-sm font-bold text-[#024b85]">
                                        Paciente
                                    </th>
                                    <th className="text-left py-4 px-4 text-sm font-bold text-[#024b85]">
                                        Médico
                                    </th>
                                    <th className="text-left py-4 px-4 text-sm font-bold text-[#024b85]">
                                        Fecha y Hora
                                    </th>
                                    <th className="text-left py-4 px-4 text-sm font-bold text-[#024b85]">
                                        Estado
                                    </th>
                                    <th className="text-right py-4 pl-4 pr-6 text-sm font-bold text-[#024b85]">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAppointments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((appointment) => (
                                    <tr key={appointment.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                                        <td className="py-4 pl-6 pr-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <span className="font-medium text-gray-800">
                                                    {appointment.paciente?.primerNombre} {appointment.paciente?.primerApellido}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                <User className="h-3.5 w-3.5 text-gray-400" />
                                                <span>
                                                    Dr(a). {appointment.medico?.primerNombre}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-800 flex items-center gap-2">
                                                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                    {format(new Date(appointment.inicio), "PPP", { locale: es })}
                                                </div>
                                                <p className="text-gray-500 text-xs mt-1 ml-5.5 pl-0.5">
                                                    {format(new Date(appointment.inicio), "p", { locale: es })} -{" "}
                                                    {format(new Date(appointment.fin), "p", { locale: es })}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Badge
                                                className={`rounded-full px-3 py-1 font-medium ${getEstadoBadgeColor(appointment.estadoCita?.codigo)}`}
                                            >
                                                {appointment.estadoCita?.nombre || "Sin estado"}
                                            </Badge>
                                        </td>
                                        <td className="py-4 pl-4 pr-6">
                                            <TooltipProvider>
                                                <div className="flex items-center justify-end gap-1">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon" variant="ghost"
                                                                onClick={() => handleView(appointment.id)}
                                                                className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-full"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Ver Detalles</p>
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon" variant="ghost"
                                                                onClick={() => handleEdit(appointment.id)}
                                                                className="h-8 w-8 text-orange-600 hover:bg-orange-50 rounded-full"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Editar</p>
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon" variant="ghost"
                                                                className={`h-8 w-8 rounded-full ${(appointment.estadoCita?.codigo === 'cancelada_paciente' ||
                                                                    appointment.estadoCita?.codigo === 'cancelada_medico' ||
                                                                    appointment.estadoCita?.codigo === 'completada' ||
                                                                    appointment.estadoCita?.codigo === 'no_asistio')
                                                                    ? "opacity-30 cursor-not-allowed text-gray-400"
                                                                    : "text-red-600 hover:bg-red-50"
                                                                    }`}
                                                                onClick={() => {
                                                                    const codigo = appointment.estadoCita?.codigo;
                                                                    if (codigo !== 'cancelada_paciente' &&
                                                                        codigo !== 'cancelada_medico' &&
                                                                        codigo !== 'completada' &&
                                                                        codigo !== 'no_asistio') {
                                                                        handleCancelClick(appointment);
                                                                    }
                                                                }}
                                                                disabled={
                                                                    appointment.estadoCita?.codigo === 'cancelada_paciente' ||
                                                                    appointment.estadoCita?.codigo === 'cancelada_medico' ||
                                                                    appointment.estadoCita?.codigo === 'completada' ||
                                                                    appointment.estadoCita?.codigo === 'no_asistio'
                                                                }
                                                            >
                                                                <CalendarX className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Cancelar Cita</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TooltipProvider>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {renderPagination(filteredAppointments.length, currentPage, setCurrentPage)}


            <AppointmentModal
                appointmentId={selectedAppointmentId}
                isOpen={showModal}
                onClose={handleModalClose}
                mode={modalMode}
                onSuccess={handleSuccess}
            />

            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                            <CalendarX className="h-5 w-5" />
                            ¿Cancelar Cita Médica?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3 pt-2">
                            <p className="text-gray-700">
                                Estás a punto de cancelar la cita de{" "}
                                <span className="font-bold text-gray-900">
                                    {appointmentToCancel?.paciente?.primerNombre} {appointmentToCancel?.paciente?.primerApellido}
                                </span>
                                .
                            </p>
                            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-sm text-orange-800">
                                <strong>Advertencia:</strong> Esta acción notificará automáticamente al paciente y al médico.
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-xl">Mantener Cita</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                executeCancel();
                            }}
                            className="bg-red-600 hover:bg-red-700 rounded-xl"
                        >
                            Sí, Cancelar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
