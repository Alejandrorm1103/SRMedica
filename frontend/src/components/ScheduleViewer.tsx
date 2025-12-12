import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import appointmentsService, { Horario } from "../services/appointments.service";

interface HorarioPorDia {
    dia: string;
    horarios: Horario[];
}

const DIAS_SEMANA = [
    { codigo: 1, nombre: "Lunes" },
    { codigo: 2, nombre: "Martes" },
    { codigo: 3, nombre: "Miércoles" },
    { codigo: 4, nombre: "Jueves" },
    { codigo: 5, nombre: "Viernes" },
    { codigo: 6, nombre: "Sábado" },
];

export function ScheduleViewer() {
    const [schedules, setSchedules] = useState<Horario[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSchedules();
    }, []);

    const loadSchedules = async () => {
        try {
            setIsLoading(true);
            const data = await appointmentsService.getMySchedules();
            setSchedules(data);
        } catch (error: any) {
            console.error("Error loading schedules:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Agrupar horarios por día de la semana
    const schedulesByDay: HorarioPorDia[] = DIAS_SEMANA.map((dia) => {
        const horariosDelDia = schedules.filter((schedule) => schedule.diaSemana === dia.codigo);
        return {
            dia: dia.nombre,
            horarios: horariosDelDia,
        };
    });

    return (
        <Card className="p-6 bg-white">
            <h3 className="mb-4 text-primary">Horarios</h3>
            {isLoading ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                    Cargando horarios...
                </div>
            ) : (
                <div className="space-y-3">
                    {schedulesByDay.map((daySchedule) => (
                        <div key={daySchedule.dia} className="flex items-center justify-between py-2 border-b last:border-b-0">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Calendar className="h-4 w-4 text-white" />
                                </div>
                                <p className="font-medium text-sm text-primary">{daySchedule.dia}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                                {daySchedule.horarios.length > 0 ? (
                                    daySchedule.horarios.map((horario) => (
                                        <Badge key={horario.id} variant="outline" className="border-primary text-primary text-xs">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {horario.horaInicio} - {horario.horaFin}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-xs text-muted-foreground">Sin horarios</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
