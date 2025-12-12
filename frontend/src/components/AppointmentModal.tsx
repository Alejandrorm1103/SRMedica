import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import appointmentsService, { CitaDetallada } from "../services/appointments.service";
import { Calendar, Clock, User, FileText, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
interface AppointmentModalProps {
    appointmentId: number | null;
    isOpen: boolean;
    onClose: () => void;
    mode: "view" | "edit";
    onSuccess?: () => void;
}

export function AppointmentModal({ appointmentId, isOpen, onClose, mode, onSuccess }: AppointmentModalProps) {
    const [appointment, setAppointment] = useState<CitaDetallada | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        inicio: "",
        fin: "",
        motivo: "",
    });

    const isReadOnly = mode === "view";

    useEffect(() => {
        if (appointmentId && isOpen) {
            loadAppointment();
        }
    }, [appointmentId, isOpen]);

    const loadAppointment = async () => {
        if (!appointmentId) return;

        try {
            setIsLoading(true);
            const data = await appointmentsService.getAppointmentDetails(appointmentId);
            setAppointment(data);

            setFormData({
                inicio: data.inicio,
                fin: data.fin,
                motivo: data.motivo || "",
            });
        } catch (error: any) {
            console.error("Error loading appointment:", error);
            toast.error("Error al cargar los detalles de la cita");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!appointmentId) return;

        try {
            setIsSaving(true);
            await appointmentsService.rescheduleAppointment(appointmentId, {
                inicio: formData.inicio,
                fin: formData.fin,
            });
            toast.success("Cita actualizada exitosamente");
            onSuccess?.();
            onClose();
        } catch (error: any) {
            console.error("Error updating appointment:", error);
            toast.error(error.response?.data?.error?.message || "Error al actualizar la cita");
        } finally {
            setIsSaving(false);
        }
    };

    if (!appointment && !isLoading) {
        return null;
    }

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

    return (

        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "view" ? "Detalles de la Cita" : "Editar Cita"}
                    </DialogTitle>
                    <DialogDescription>
                        {appointment && (
                            <div className="flex items-center gap-2 mt-2">
                                <span className="font-semibold">
                                    Cita #{appointment.id}
                                </span>
                                <Badge
                                    variant="default"
                                    className={getEstadoBadgeColor(appointment.estadoCita?.codigo)}
                                >
                                    {appointment.estadoCita?.nombre || "Sin estado"}
                                </Badge>
                            </div>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-8 text-center text-muted-foreground">
                        Cargando detalles de la cita...
                    </div>
                ) : appointment ? (
                    <div className="space-y-6">
                        {/* Información del Paciente */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Paciente
                            </h4>
                            <div className="p-3 bg-muted rounded-md">
                                <p className="font-medium">
                                    {appointment.paciente?.primerNombre} {appointment.paciente?.primerApellido}
                                </p>
                            </div>
                        </div>

                        {/* Información del Médico */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Médico
                            </h4>
                            <div className="p-3 bg-muted rounded-md">
                                <p className="font-medium">
                                    Dr(a). {appointment.medico?.primerNombre} {appointment.medico?.primerApellido}
                                </p>
                                {appointment.medico?.especialidades && appointment.medico.especialidades.length > 0 && (
                                    <div className="flex gap-1 mt-2">
                                        {appointment.medico.especialidades.map((esp) => (
                                            <Badge key={esp.especialidad.id} variant="outline" className="text-xs">
                                                {esp.especialidad.nombre}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Fecha y Hora */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="inicio" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Fecha y Hora de Inicio
                                </Label>
                                <Input
                                    id="inicio"
                                    type="datetime-local"
                                    value={formData.inicio.slice(0, 16)}
                                    onChange={(e) => handleChange("inicio", e.target.value)}
                                    disabled={isReadOnly}
                                    className="bg-white"
                                />
                                {isReadOnly && (
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(appointment.inicio), "PPP 'a las' p", { locale: es })}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fin" className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Hora de Fin
                                </Label>
                                <Input
                                    id="fin"
                                    type="datetime-local"
                                    value={formData.fin.slice(0, 16)}
                                    onChange={(e) => handleChange("fin", e.target.value)}
                                    disabled={isReadOnly}
                                    className="bg-white"
                                />
                                {isReadOnly && (
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(appointment.fin), "p", { locale: es })}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Motivo */}
                        <div className="space-y-2">
                            <Label htmlFor="motivo" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Motivo de la Consulta
                            </Label>
                            <Input
                                id="motivo"
                                value={formData.motivo}
                                onChange={(e) => handleChange("motivo", e.target.value)}
                                disabled={isReadOnly}
                                className="bg-white"
                                placeholder="Motivo de la consulta"
                            />
                        </div>

                        {/* Historial de Cambios */}
                        {appointment.historiales && appointment.historiales.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground">
                                    Historial de Cambios
                                </h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {appointment.historiales.map((historial) => (
                                        <div key={historial.id} className="p-2 bg-muted rounded text-xs">
                                            <p className="font-medium">{historial.motivo || "Cambio de estado"}</p>
                                            <p className="text-muted-foreground">
                                                {format(new Date(historial.fechaCreacion), "PPP 'a las' p", { locale: es })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        {mode === "view" ? "Cerrar" : "Cancelar"}
                    </Button>
                    {mode === "edit" && (
                        <Button onClick={handleSubmit} disabled={isSaving || isLoading}>
                            {isSaving ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>

    );
}
