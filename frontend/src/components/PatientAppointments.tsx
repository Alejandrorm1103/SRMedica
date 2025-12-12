import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useState, useEffect } from "react";
import { Calendar, Clock, User, Eye, XCircle } from "lucide-react";
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

export function PatientAppointments() {
    const navigate = useNavigate();
    const [upcomingAppointments, setUpcomingAppointments] = useState<Cita[]>([]);
    const [historyAppointments, setHistoryAppointments] = useState<Cita[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal state
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Alert Dialog  state
    const [alertOpen, setAlertOpen] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            setIsLoading(true);
            const [upcoming, history] = await Promise.all([
                appointmentsService.getUpcoming(20),
                appointmentsService.getHistory(20),
            ]);

            setUpcomingAppointments(upcoming);
            setHistoryAppointments(history);
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

    const confirmCancel = (appointmentId: number) => {
        setAppointmentToCancel(appointmentId);
        setAlertOpen(true);
    };

    const handleCancelExecution = async () => {
        if (!appointmentToCancel) return;

        try {
            await appointmentsService.cancelAppointment(appointmentToCancel, "paciente_cancela");
            toast.success("Cita cancelada exitosamente");
            loadAppointments();
        } catch (error: any) {
            console.error("Error cancelling appointment:", error);
            toast.error("Error al cancelar la cita");
        } finally {
            setAlertOpen(false);
            setAppointmentToCancel(null);
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
                            Dr(a). {appointment.medico?.primerNombre} {appointment.medico?.primerApellido}
                        </span>
                        <Badge
                            variant="default"
                            className={getEstadoBadgeColor(appointment.estadoCita?.codigo)}
                        >
                            {appointment.estadoCita?.nombre}
                        </Badge>
                    </div>

                    {/* Especialidades del médico */}
                    {appointment.medico?.especialidades && appointment.medico.especialidades.length > 0 && (
                        <div className="flex gap-1 mb-2">
                            {appointment.medico.especialidades.map((esp) => (
                                <Badge key={esp.especialidad.id} variant="outline" className="text-xs">
                                    {esp.especialidad.nombre}
                                </Badge>
                            ))}
                        </div>
                    )}

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

                            {(appointment.estadoCita?.codigo === "programada" ||
                                appointment.estadoCita?.codigo === "confirmada") && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => confirmCancel(appointment.id)}
                                                className="text-red-900 bg-red-100/50 hover:bg-red-200 hover:text-red-700"
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Cancelar Cita</p>
                                        </TooltipContent>
                                    </Tooltip>
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
                    <div className="flex gap-2">
                        <Button
                            onClick={() => navigate("/paciente/doctors")}
                            className="bg-primary hover:bg-secondary"
                        >
                            <Calendar className="h-4 w-4 mr-2" />
                            Agendar Nueva Cita
                        </Button>
                        <Button variant="outline" onClick={() => navigate("/paciente/home")}>
                            Volver al Inicio
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="upcoming" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-md">
                        <TabsTrigger value="upcoming">
                            Próximas ({upcomingAppointments.length})
                        </TabsTrigger>
                        <TabsTrigger value="history">
                            Historial ({historyAppointments.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab Próximas */}
                    <TabsContent value="upcoming" className="mt-6">
                        {isLoading ? (
                            <div className="py-8 text-center text-muted-foreground">
                                Cargando citas...
                            </div>
                        ) : upcomingAppointments.length === 0 ? (
                            <Card className="p-8 text-center">
                                <p className="text-muted-foreground mb-4">
                                    No tienes citas próximas
                                </p>
                                <Button
                                    onClick={() => navigate("/paciente/doctors")}
                                    className="bg-primary hover:bg-secondary"
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Agendar Cita
                                </Button>
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

                {/* Modal View */}
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

                {/* Alert Dialog Cancel */}
                <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Cancelar cita médica?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción cancelará tu cita. El médico será notificado inmediatamente.
                                Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Volver</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCancelExecution} className="bg-red-600 hover:bg-red-700">
                                Sí, Cancelar Cita
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
