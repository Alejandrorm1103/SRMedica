import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useState, useEffect } from "react";
import { Calendar, Clock, User, CheckCircle, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import appointmentsService, { Cita } from "../services/appointments.service";
import { AppointmentModal } from "./AppointmentModal";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

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

export function DoctorAppointments() {
    const navigate = useNavigate();
    const [todayAppointments, setTodayAppointments] = useState<Cita[]>([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState<Cita[]>([]);
    const [historyAppointments, setHistoryAppointments] = useState<Cita[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal state
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Alert Dialog state
    const [noShowAlertOpen, setNoShowAlertOpen] = useState(false);
    const [appointmentToNoShow, setAppointmentToNoShow] = useState<number | null>(null);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            setIsLoading(true);
            const [today, upcoming, history] = await Promise.all([
                appointmentsService.getToday(),
                appointmentsService.getUpcoming(100),
                appointmentsService.getHistory(100),
            ]);

            // Filtrar próximas para que sean estrictamente de mañana en adelante
            const startOfTomorrow = new Date();
            startOfTomorrow.setHours(0, 0, 0, 0);
            startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

            const futureAppointments = upcoming.filter(a =>
                new Date(a.inicio) >= startOfTomorrow
            );

            // Filtrar historial para que sean estrictamente antes de hoy
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const pastAppointments = history.filter(a =>
                new Date(a.inicio) < startOfToday
            );

            setTodayAppointments(today);
            setUpcomingAppointments(futureAppointments);
            setHistoryAppointments(pastAppointments);
        } catch (error: any) {
            console.error("Error loading appointments:", error);
            toast.error("Error al cargar las citas");
        } finally {
            setIsLoading(false);
        }
    };

    const handleView = (appointmentId: number) => {
        setSelectedAppointmentId(appointmentId);
        setShowModal(true);
    };

    const handleConfirm = async (appointmentId: number) => {
        try {
            await appointmentsService.confirmAppointment(appointmentId);
            toast.success("Cita confirmada exitosamente");
            loadAppointments();
        } catch (error: any) {
            console.error("Error confirming appointment:", error);
            toast.error("Error al confirmar la cita");
        }
    };

    const handleComplete = async (appointmentId: number) => {
        try {
            await appointmentsService.completeAppointment(appointmentId);
            toast.success("Cita marcada como completada");
            loadAppointments();
        } catch (error: any) {
            console.error("Error completing appointment:", error);
            toast.error("Error al completar la cita");
        }
    };

    const confirmNoShow = (appointmentId: number) => {
        setAppointmentToNoShow(appointmentId);
        setNoShowAlertOpen(true);
    };

    const executeNoShow = async () => {
        if (!appointmentToNoShow) return;

        try {
            await appointmentsService.markNoShow(appointmentToNoShow);
            toast.success("Cita marcada como no asistió");
            loadAppointments();
        } catch (error: any) {
            console.error("Error marking no show:", error);
            toast.error("Error al marcar no asistió");
        } finally {
            setNoShowAlertOpen(false);
            setAppointmentToNoShow(null);
        }
    };

    const getEstadoBadgeColor = (codigo?: string) => {
        switch (codigo) {
            case "programada":
                return "bg-blue-500";
            case "confirmada":
                return "bg-green-500";
            case "completada":
                return "bg-gray-500";
            case "cancelada_paciente":
            case "cancelada_medico":
                return "bg-red-500";
            case "reprogramada":
                return "bg-yellow-500";
            case "no_asistio":
                return "bg-orange-500";
            default:
                return "bg-gray-400";
        }
    };

    const renderAppointmentCard = (appointment: Cita, showActions = true) => (
        <Card key={appointment.id} className="p-4">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                            {appointment.paciente?.primerNombre} {appointment.paciente?.primerApellido}
                        </span>
                        <Badge
                            variant="default"
                            className={getEstadoBadgeColor(appointment.estadoCita?.codigo)}
                        >
                            {appointment.estadoCita?.nombre}
                        </Badge>
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(appointment.inicio), "PPP", { locale: es })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>
                                {format(new Date(appointment.inicio), "p", { locale: es })} -{" "}
                                {format(new Date(appointment.fin), "p", { locale: es })}
                            </span>
                        </div>
                        {appointment.motivo && (
                            <div className="mt-2 text-xs">
                                <span className="font-medium">Motivo:</span> {appointment.motivo}
                            </div>
                        )}
                    </div>
                </div>

                {showActions && (
                    <div className="flex flex-col gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleView(appointment.id)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Ver Detalles</p>
                                </TooltipContent>
                            </Tooltip>

                            {appointment.estadoCita?.codigo === "programada" && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleConfirm(appointment.id)}
                                            className="text-green-600 hover:text-green-700"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Confirmar Cita</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            {appointment.estadoCita?.codigo === "confirmada" && (
                                <>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleComplete(appointment.id)}
                                                className="text-blue-600 hover:text-blue-700"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Completar Cita</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => confirmNoShow(appointment.id)}
                                                className="text-orange-600 hover:text-orange-700"
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Marcar No Asistió</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </>
                            )}
                        </TooltipProvider>
                    </div>
                )}
            </div>
        </Card>
    );

    return (
        <div className="flex-1 container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                            <Calendar className="h-6 w-6" />
                            Mis Citas
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Gestiona tus citas médicas
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => navigate("/medico/home")}
                    >
                        Volver al Inicio
                    </Button>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="today" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 max-w-2xl">
                        <TabsTrigger value="today">
                            Hoy ({todayAppointments.length})
                        </TabsTrigger>
                        <TabsTrigger value="upcoming">
                            Próximas ({upcomingAppointments.length})
                        </TabsTrigger>
                        <TabsTrigger value="history">
                            Historial ({historyAppointments.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab Hoy */}
                    <TabsContent value="today" className="mt-6">
                        {isLoading ? (
                            <div className="py-8 text-center text-muted-foreground">
                                Cargando citas...
                            </div>
                        ) : todayAppointments.length === 0 ? (
                            <Card className="p-8 text-center text-muted-foreground">
                                No tienes citas programadas para hoy
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {todayAppointments.map((apt) => renderAppointmentCard(apt))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Tab Próximas */}
                    <TabsContent value="upcoming" className="mt-6">
                        {isLoading ? (
                            <div className="py-8 text-center text-muted-foreground">
                                Cargando citas...
                            </div>
                        ) : upcomingAppointments.length === 0 ? (
                            <Card className="p-8 text-center text-muted-foreground">
                                No tienes citas próximas
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {upcomingAppointments.map((apt) => renderAppointmentCard(apt))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Tab Historial */}
                    <TabsContent value="history" className="mt-6">
                        {isLoading ? (
                            <div className="py-8 text-center text-muted-foreground">
                                Cargando historial...
                            </div>
                        ) : historyAppointments.length === 0 ? (
                            <Card className="p-8 text-center text-muted-foreground">
                                No tienes citas en el historial
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {historyAppointments.map((apt) => renderAppointmentCard(apt, false))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Modal */}
                <AppointmentModal
                    appointmentId={selectedAppointmentId}
                    isOpen={showModal}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedAppointmentId(null);
                    }}
                    mode="view"
                    onSuccess={loadAppointments}
                />

                {/* Alert Dialog No Show */}
                <AlertDialog open={noShowAlertOpen} onOpenChange={setNoShowAlertOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Marcar como No Asistió?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción marcará que el paciente no asistió a la cita.
                                Esto afectará el historial del paciente.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={executeNoShow} className="bg-orange-600 hover:bg-orange-700">
                                Sí, Marcar No Asistió
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
