import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Bell, Check } from "lucide-react";
import { useState, useEffect } from "react";
import notificationsService, { Notificacion } from "../services/notifications.service";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function NotificationsWidget() {
    const [notifications, setNotifications] = useState<Notificacion[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadNotifications();
        // Polling cada 30 segundos
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
        try {
            setIsLoading(true);
            const data = await notificationsService.getMyNotifications(50);
            // Ordenar por fecha (más reciente primero) y mostrar solo las últimas 2
            const sorted = data.sort((a, b) =>
                new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
            );
            setNotifications(sorted.slice(0, 2));
        } catch (error: any) {
            console.error("Error loading notifications:", error);
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

    const getTipoColor = (tipo: string) => {
        if (!tipo) return "bg-gradient-to-r from-gray-50 to-gray-100/50 border-gray-200";
        if (tipo.includes("cita_nueva") || tipo.includes("cita_creada")) {
            return "bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200";
        }
        if (tipo.includes("confirmada")) {
            return "bg-gradient-to-r from-green-50 to-green-100/50 border-green-200";
        }
        if (tipo.includes("cancelada")) {
            return "bg-gradient-to-r from-red-50 to-red-100/50 border-red-200";
        }
        if (tipo.includes("reprogramada")) {
            return "bg-gradient-to-r from-yellow-50 to-yellow-100/50 border-yellow-200";
        }
        return "bg-gradient-to-r from-gray-50 to-gray-100/50 border-gray-200";
    };

    const getTipoIconColor = (tipo: string) => {
        if (!tipo) return "text-gray-600 bg-gray-100 rounded-full p-1.5";
        if (tipo.includes("cita_nueva") || tipo.includes("cita_creada")) {
            return "text-blue-600 bg-blue-100 rounded-full p-1.5";
        }
        if (tipo.includes("confirmada")) {
            return "text-green-600 bg-green-100 rounded-full p-1.5";
        }
        if (tipo.includes("cancelada")) {
            return "text-red-600 bg-red-100 rounded-full p-1.5";
        }
        if (tipo.includes("reprogramada")) {
            return "text-yellow-600 bg-yellow-100 rounded-full p-1.5";
        }
        return "text-gray-600 bg-gray-100 rounded-full p-1.5";
    };

    if (isLoading && notifications.length === 0) {
        return (
            <Card className="p-6 bg-white shadow-sm border-primary/10">
                <h3 className="mb-4 text-primary font-semibold flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Últimas Notificaciones
                </h3>
                <div className="text-sm text-muted-foreground text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6 bg-white shadow-xl shadow-blue-900/5 border-blue-100 rounded-[2rem]">
            <h3 className="mb-4 text-primary font-bold text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <span className="text-[#024b85]">Últimas Notificaciones</span>
            </h3>
            {notifications.length === 0 ? (
                <div className="text-sm text-blue-400 text-center py-8 bg-blue-50/50 rounded-xl border border-blue-100 border-dashed">
                    No tienes notificaciones nuevas
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-3 rounded-xl border flex gap-3 transition-all hover:bg-white hover:shadow-md ${getTipoColor(
                                notification.tipo
                            )}`}
                        >
                            <div className="flex-shrink-0 mt-0.5">
                                <div className={`p-1.5 rounded-full bg-white shadow-sm`}>
                                    <Bell className={`h-4 w-4 ${getTipoIconColor(notification.tipo).split(' ')[0]}`} />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 leading-snug mb-1">
                                    {notification.payload?.mensaje || "Nueva notificación"}
                                </p>
                                <p className="text-xs text-slate-500 font-medium my-0.5">
                                    {format(new Date(notification.fechaCreacion), "PPp", {
                                        locale: es,
                                    })}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="h-8 w-8 p-0 hover:bg-white rounded-full flex-shrink-0 text-blue-300 hover:text-blue-600"
                                title="Marcar como leída"
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
