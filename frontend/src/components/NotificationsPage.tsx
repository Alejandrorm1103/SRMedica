import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Bell, Check, Calendar, Clock } from "lucide-react";
import notificationsService, { Notificacion } from "../services/notifications.service";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "../context/AuthContext";

export function NotificationsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notificacion[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setIsLoading(true);
            const data = await notificationsService.getMyNotifications(100);
            const sorted = data.sort((a, b) =>
                new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
            );
            setNotifications(sorted);
        } catch (error: any) {
            console.error("Error loading notifications:", error);
            toast.error("Error al cargar notificaciones");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationsService.markAsRead(id);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            toast.success("Notificación marcada como leída");
        } catch (error: any) {
            console.error("Error marking as read:", error);
            toast.error("Error al marcar como leída");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsService.markAllAsRead();
            setNotifications([]);
            toast.success("Todas las notificaciones marcadas como leídas");
        } catch (error: any) {
            console.error("Error marking all as read:", error);
            toast.error("Error al marcar todas como leídas");
        }
    };

    const getTipoColor = (tipo: string) => {
        if (tipo.includes("cita_nueva") || tipo.includes("cita_creada")) {
            return "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300";
        }
        if (tipo.includes("confirmada")) {
            return "bg-gradient-to-r from-green-50 to-green-100 border-green-300";
        }
        if (tipo.includes("cancelada")) {
            return "bg-gradient-to-r from-red-50 to-red-100 border-red-300";
        }
        if (tipo.includes("reprogramada") || tipo.includes("recordatorio")) {
            return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300";
        }
        return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300";
    };

    const getTipoIcon = (tipo: string) => {
        if (tipo.includes("cita_nueva") || tipo.includes("cita_creada")) {
            return { icon: Calendar, color: "text-blue-600 bg-blue-100" };
        }
        if (tipo.includes("confirmada")) {
            return { icon: Check, color: "text-green-600 bg-green-100" };
        }
        if (tipo.includes("recordatorio")) {
            return { icon: Clock, color: "text-yellow-600 bg-yellow-100" };
        }
        return { icon: Bell, color: "text-gray-600 bg-gray-100" };
    };

    return (
        <div className="flex-1 container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                            <Bell className="h-6 w-6" />
                            Notificaciones
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Todas tus notificaciones
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => {
                        if (user?.role === 'medico') navigate("/medico/home");
                        else if (user?.role === 'paciente') navigate("/paciente/home");
                        else navigate("/");
                    }}>
                        Volver al Inicio
                    </Button>
                </div>

                {/* Card de Notificaciones */}
                <Card className="bg-white shadow-xl border-0">
                    <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Bell className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {notifications.length} Notificación{notifications.length !== 1 ? "es" : ""}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {notifications.length > 0 ? "Tienes mensajes sin leer" : "Estás al día"}
                                    </p>
                                </div>
                            </div>
                            {notifications.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleMarkAllAsRead}
                                    className="border-primary text-primary hover:bg-primary hover:text-white transition-all"
                                >
                                    <Check className="h-4 w-4 mr-2" />
                                    Marcar todas como leídas
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="p-6">
                        {isLoading ? (
                            <div className="text-center py-16">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-gray-500">Cargando notificaciones...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                    <Bell className="h-12 w-12 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">No tienes notificaciones</h3>
                                <p className="text-gray-500">Cuando recibas nuevas notificaciones, aparecerán aquí</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {notifications.map((notification) => {
                                    const iconData = getTipoIcon(notification.tipo);
                                    const IconComponent = iconData.icon;

                                    return (
                                        <div
                                            key={notification.id}
                                            className={`group relative p-5 rounded-xl border-2 ${getTipoColor(notification.tipo)} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Icono */}
                                                <div className={`flex-shrink-0 h-12 w-12 rounded-full ${iconData.color} flex items-center justify-center shadow-md`}>
                                                    <IconComponent className="h-6 w-6" />
                                                </div>

                                                {/* Contenido */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-base font-semibold text-gray-800 mb-2 leading-relaxed">
                                                        {notification.payload.mensaje}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{format(new Date(notification.fechaCreacion), "PPpp", { locale: es })}</span>
                                                    </div>
                                                </div>

                                                {/* Botón marcar como leída */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/50"
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                >
                                                    <Check className="h-4 w-4 mr-1" />
                                                    Leída
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
