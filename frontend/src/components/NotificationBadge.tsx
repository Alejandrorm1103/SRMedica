import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";
import notificationsService from "../services/notifications.service";
import { toast } from "sonner";

interface NotificationBadgeProps {
    className?: string;
    onClick?: () => void;
}

export function NotificationBadge({ className, onClick }: NotificationBadgeProps) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadUnreadCount();
        // Polling cada 30 segundos
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadUnreadCount = async () => {
        try {
            setIsLoading(true);
            const count = await notificationsService.getUnreadCount();
            setUnreadCount(count);
        } catch (error: any) {
            // Silencioso - no mostrar error al usuario
            console.error("Error loading unread count:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            className={`relative ${className}`}
            onClick={onClick}
            disabled={isLoading}
        >
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
    );
}
