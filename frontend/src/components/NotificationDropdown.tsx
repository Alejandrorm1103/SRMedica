import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useState, useEffect } from "react";
import notificationsService, { Notificacion } from "../services/notifications.service";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notificacion[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        }
    }, [isOpen]);

    useEffect(() => {
        loadUnreadCount();
        // Polling cada 30 segundos
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadUnreadCount = async () => {
        try {
            const count = await notificationsService.getUnreadCount();
            setUnreadCount(count);
        } catch (error: any) {
            console.error("Error loading unread count:", error);
        }
    };

    const loadNotifications = async () => {
        try {
            setIsLoading(true);
            const data = await notificationsService.getMyNotifications(20);
            setNotifications(data);
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
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id ? { ...n, payload: { ...n.payload, leida: true } } : n
                )
            );
            loadUnreadCount();
        } catch (error: any) {
            console.error("Error marking as read:", error);
            toast.error("Error al marcar como leída");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsService.markAllAsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, payload: { ...n.payload, leida: true } }))
            );
            setUnreadCount(0);
            toast.success("Todas las notificaciones marcadas como leídas");
        } catch (error: any) {
            console.error("Error marking all as read:", error);
            toast.error("Error al marcar todas como leídas");
        }
    };

    const getTipoColor = (tipo: string) => {
        if (tipo.includes("cita_nueva") || tipo.includes("cita_creada")) {
            return "bg-blue-500";
        }
        if (tipo.includes("confirmada")) {
            return "bg-green-500";
        }
        if (tipo.includes("cancelada")) {
            return "bg-red-500";
        }
        if (tipo.includes("reprogramada")) {
            return "bg-yellow-500";
        }
        if (tipo.includes("recordatorio")) {
            return "bg-purple-500";
        }
        return "bg-gray-500";
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notificaciones</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="h-6 text-xs"
                        >
                            <CheckCheck className="h-3 w-3 mr-1" />
                            Marcar todas
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {isLoading ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                        Cargando...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                        No tienes notificaciones
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <DropdownMenuItem
                            key={notification.id}
                            className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notification.payload.leida ? "bg-blue-50" : ""
                                }`}
                            onClick={() => {
                                if (!notification.payload.leida) {
                                    handleMarkAsRead(notification.id);
                                }
                            }}
                        >
                            <div className="flex items-start gap-2 w-full">
                                <div
                                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getTipoColor(
                                        notification.tipo
                                    )}`}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium line-clamp-2">
                                        {notification.payload.mensaje}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {format(new Date(notification.fechaCreacion), "PPp", {
                                            locale: es,
                                        })}
                                    </p>
                                </div>
                                {!notification.payload.leida && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 flex-shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMarkAsRead(notification.id);
                                        }}
                                    >
                                        <Check className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        </DropdownMenuItem>
                    ))
                )}

                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="justify-center text-xs text-primary cursor-pointer">
                            Ver todas las notificaciones
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
