import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CheckCircle, XCircle, User, Mail, Calendar, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

interface PendingDoctor {
    id: number;
    usuario_id: number;
    primer_nombre: string;
    segundo_nombre?: string;
    primer_apellido: string;
    segundo_apellido?: string;
    email?: string;
    registro_profesional: string;
    especialidades?: Array<{ nombre: string }>;
    fecha_creacion: string;
    estado: boolean;
    emailConfirmado?: boolean;
}

export function PendingDoctorsPanel() {
    const [doctors, setDoctors] = useState<PendingDoctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activatingId, setActivatingId] = useState<number | null>(null);

    const loadPendingDoctors = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get('/doctors');

            // Validar estructura de respuesta
            if (!data || !data.data || !Array.isArray(data.data.items)) {
                setDoctors([]);
                return;
            }

            // Filtrar médicos que no están activos o no tienen email confirmado
            const pending = data.data.items.filter((doc: any) =>
                !doc.estado || !doc.emailConfirmado
            );

            setDoctors(pending);
        } catch (error: any) {
            console.error("Error loading pending doctors:", error);
            // No mostrar toast de error, solo establecer array vacío
            setDoctors([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPendingDoctors();
    }, []);

    const handleActivate = async (usuarioId: number, doctorId: number) => {
        try {
            setActivatingId(doctorId);

            // Llamar al endpoint de activación
            await api.post('/auth/admin/activate-user', {
                usuarioId: usuarioId
            });

            toast.success("Médico activado exitosamente");

            // Recargar la lista
            await loadPendingDoctors();
        } catch (error: any) {
            console.error("Error activating doctor:", error);
            toast.error(error.response?.data?.error?.message || "Error al activar médico");
        } finally {
            setActivatingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </Card>
        );
    }

    if (doctors.length === 0) {
        return (
            <Card className="p-6">
                <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        No hay médicos pendientes
                    </h3>
                    <p className="text-sm text-gray-500">
                        Todos los médicos han sido activados
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Médicos Pendientes de Activación
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {doctors.length} médico{doctors.length !== 1 ? 's' : ''} esperando aprobación
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={loadPendingDoctors}
                    disabled={isLoading}
                >
                    Actualizar
                </Button>
            </div>

            <div className="space-y-4">
                {doctors.map((doctor) => (
                    <Card key={doctor.id} className="p-4 border-l-4 border-l-yellow-500">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                                {/* Nombre */}
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span className="font-semibold text-gray-900">
                                        {doctor.primer_nombre} {doctor.segundo_nombre || ''} {doctor.primer_apellido} {doctor.segundo_apellido || ''}
                                    </span>
                                </div>

                                {/* Email */}
                                {doctor.email && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <span>{doctor.email}</span>
                                    </div>
                                )}

                                {/* Registro Profesional */}
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Stethoscope className="h-4 w-4 text-gray-400" />
                                    <span>Registro: {doctor.registro_profesional}</span>
                                </div>

                                {/* Especialidades */}
                                {doctor.especialidades && doctor.especialidades.length > 0 && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {doctor.especialidades.map((esp, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                {esp.nombre}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {/* Fecha de registro */}
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Calendar className="h-3 w-3" />
                                    <span>Registrado: {formatDate(doctor.fecha_creacion)}</span>
                                </div>

                                {/* Estado */}
                                <div className="flex items-center gap-2">
                                    {!doctor.estado && (
                                        <Badge variant="destructive" className="text-xs">
                                            <XCircle className="h-3 w-3 mr-1" />
                                            Cuenta Inactiva
                                        </Badge>
                                    )}
                                    {!doctor.emailConfirmado && (
                                        <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700">
                                            <Mail className="h-3 w-3 mr-1" />
                                            Email no confirmado
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Botón de Activar */}
                            <Button
                                onClick={() => handleActivate(doctor.usuario_id, doctor.id)}
                                disabled={activatingId === doctor.id}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {activatingId === doctor.id ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Activando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Activar
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </Card>
    );
}
