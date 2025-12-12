import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useState, useEffect } from "react";
import { Calendar, Clock, Plus, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import appointmentsService, { Horario } from "../services/appointments.service";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

export function DoctorScheduleManagement() {
    const navigate = useNavigate();
    const [schedules, setSchedules] = useState<Horario[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Formulario - Múltiples franjas
    const [selectedDay, setSelectedDay] = useState<number>(1);
    const [franjas, setFranjas] = useState<Array<{ horaInicio: string; horaFin: string }>>([
        { horaInicio: "09:00", horaFin: "13:00" },
    ]);
    const [duracionCita, setDuracionCita] = useState(30);

    useEffect(() => {
        loadSchedules();
    }, []);

    // Cargar horarios del día seleccionado cuando cambia
    useEffect(() => {
        if (schedules.length > 0) {
            // Filtrar horarios por día de semana directamente
            const horariosDelDia = schedules.filter((schedule) => schedule.diaSemana === selectedDay);

            if (horariosDelDia.length > 0) {
                // Cargar horarios existentes en el formulario
                const franjasExistentes = horariosDelDia.map((horario) => ({
                    horaInicio: horario.horaInicio,
                    horaFin: horario.horaFin,
                }));
                setFranjas(franjasExistentes);
            } else {
                // Si no hay horarios, resetear a formulario vacío
                setFranjas([{ horaInicio: "09:00", horaFin: "13:00" }]);
            }
        }
    }, [selectedDay, schedules]);

    const loadSchedules = async () => {
        try {
            setIsLoading(true);
            const data = await appointmentsService.getMySchedules();
            setSchedules(data);
        } catch (error: any) {
            console.error("Error loading schedules:", error);
            toast.error("Error al cargar los horarios");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSchedules = async () => {
        // Validar que todas las franjas tengan datos
        for (const franja of franjas) {
            if (!franja.horaInicio || !franja.horaFin) {
                toast.error("Por favor completa todos los horarios");
                return;
            }
            if (franja.horaInicio >= franja.horaFin) {
                toast.error("La hora de inicio debe ser menor que la hora de fin");
                return;
            }
        }

        // Validar que no haya solapamiento entre las franjas nuevas
        for (let i = 0; i < franjas.length; i++) {
            for (let j = i + 1; j < franjas.length; j++) {
                const franja1 = franjas[i];
                const franja2 = franjas[j];

                if (
                    (franja1.horaInicio < franja2.horaFin && franja1.horaFin > franja2.horaInicio) ||
                    (franja2.horaInicio < franja1.horaFin && franja2.horaFin > franja1.horaInicio)
                ) {
                    toast.error(`Las franjas ${i + 1} y ${j + 1} se solapan. Por favor ajusta los horarios.`);
                    return;
                }
            }
        }

        try {
            // Obtener horarios existentes del día seleccionado
            const horariosDelDia = schedules.filter((schedule) => schedule.diaSemana === selectedDay);

            // Si hay horarios existentes, eliminarlos primero
            if (horariosDelDia.length > 0) {
                for (const horario of horariosDelDia) {
                    await appointmentsService.deleteSchedule(horario.id);
                }
            }

            // Crear todas las franjas del formulario
            for (const franja of franjas) {
                await appointmentsService.createSchedule({
                    medicoId: 1,
                    diaSemana: selectedDay,
                    horaInicio: franja.horaInicio,
                    horaFin: franja.horaFin,
                });
            }

            if (horariosDelDia.length > 0) {
                toast.success(`Horarios actualizados exitosamente (${franjas.length} franja(s))`);
            } else {
                toast.success(`${franjas.length} franja(s) horaria(s) guardada(s) exitosamente`);
            }

            loadSchedules();
        } catch (error: any) {
            console.error("Error saving schedules:", error);
            const errorMessage = error.response?.data?.error?.message || "Error al guardar los horarios";

            // Mensaje más claro si es error de solapamiento
            if (errorMessage.includes("conflicto") || errorMessage.includes("exclusion")) {
                toast.error("Hay un conflicto de horarios. Por favor verifica que las franjas no se solapen con las existentes.");
            } else {
                toast.error(errorMessage);
            }
        }
    };

    const handleDeleteSchedule = async (id: number) => {
        if (!confirm("¿Estás seguro de eliminar este horario?")) return;

        try {
            await appointmentsService.deleteSchedule(id);
            toast.success("Horario eliminado exitosamente");
            loadSchedules();
        } catch (error: any) {
            console.error("Error deleting schedule:", error);
            toast.error("Error al eliminar el horario");
        }
    };

    const resetForm = () => {
        setSelectedDay(1);
        setFranjas([{ horaInicio: "09:00", horaFin: "13:00" }]);
        setDuracionCita(30);
    };

    const agregarFranja = () => {
        setFranjas([...franjas, { horaInicio: "14:00", horaFin: "18:00" }]);
    };

    const eliminarFranja = (index: number) => {
        if (franjas.length === 1) {
            toast.error("Debe haber al menos una franja horaria");
            return;
        }
        setFranjas(franjas.filter((_, i) => i !== index));
    };

    const actualizarFranja = (index: number, campo: "horaInicio" | "horaFin", valor: string) => {
        const nuevasFranjas = [...franjas];
        nuevasFranjas[index][campo] = valor;
        setFranjas(nuevasFranjas);
    };

    const incrementDuration = () => {
        setDuracionCita((prev) => Math.min(prev + 5, 120));
    };

    const decrementDuration = () => {
        setDuracionCita((prev) => Math.max(prev - 5, 10));
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
        <div className="flex-1 container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                            <Calendar className="h-6 w-6" />
                            Gestión de Horarios
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Define tu disponibilidad para atender pacientes
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => navigate("/medico/home")}>
                        Volver al Inicio
                    </Button>
                </div>

                {/* Información */}
                <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
                    <div className="flex items-start gap-2">
                        <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-blue-900 font-medium">
                                Información importante
                            </p>
                            <p className="text-sm text-blue-800 mt-1">
                                Los domingos y días festivos no se atienden pacientes. Define tus horarios de Lunes a Sábado.
                                Puedes agregar múltiples franjas horarias por día (ej: mañana, tarde, noche).
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="ver" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-md">
                        <TabsTrigger value="ver">Ver Horarios</TabsTrigger>
                        <TabsTrigger value="editar">Editar Horarios</TabsTrigger>
                    </TabsList>

                    {/* Tab Ver Horarios */}
                    <TabsContent value="ver" className="mt-6">
                        {isLoading ? (
                            <div className="py-8 text-center text-muted-foreground">
                                Cargando horarios...
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {schedulesByDay.map((daySchedule) => (
                                    <Card key={daySchedule.dia} className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                                    <Calendar className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-primary">{daySchedule.dia}</p>
                                                    {daySchedule.horarios.length === 0 && (
                                                        <p className="text-xs text-muted-foreground">Sin horarios definidos</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap justify-end">
                                                {daySchedule.horarios.length > 0 ? (
                                                    daySchedule.horarios.map((horario) => (
                                                        <div key={horario.id} className="flex items-center gap-2">
                                                            <Badge variant="outline" className="border-primary text-primary">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                {horario.horaInicio} - {horario.horaFin}
                                                            </Badge>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteSchedule(horario.id)}
                                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))
                                                ) : null}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Tab Editar Horarios */}
                    <TabsContent value="editar" className="mt-6">
                        <Card className="p-6">
                            <h3 className="font-semibold text-lg mb-6 text-primary">
                                Agregar Horarios
                            </h3>

                            <div className="space-y-6">
                                {/* Día de la Semana */}
                                <div className="space-y-2">
                                    <Label htmlFor="dia">Día de la Semana</Label>
                                    <select
                                        id="dia"
                                        value={selectedDay}
                                        onChange={(e) => setSelectedDay(Number(e.target.value))}
                                        className="w-full p-2 rounded-lg bg-white border border-input focus:border-primary"
                                    >
                                        {DIAS_SEMANA.map((dia) => (
                                            <option key={dia.codigo} value={dia.codigo}>
                                                {dia.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Franjas Horarias */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Franjas Horarias</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={agregarFranja}
                                            className="border-primary text-primary"
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Agregar Franja
                                        </Button>
                                    </div>

                                    {franjas.map((franja, index) => (
                                        <Card key={index} className="p-4 bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 grid md:grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Hora Inicio</Label>
                                                        <Input
                                                            type="time"
                                                            value={franja.horaInicio}
                                                            onChange={(e) => actualizarFranja(index, "horaInicio", e.target.value)}
                                                            className="bg-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Hora Fin</Label>
                                                        <Input
                                                            type="time"
                                                            value={franja.horaFin}
                                                            onChange={(e) => actualizarFranja(index, "horaFin", e.target.value)}
                                                            className="bg-white"
                                                        />
                                                    </div>
                                                </div>
                                                {franjas.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => eliminarFranja(index)}
                                                        className="text-red-600 hover:text-red-700 mt-5"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </Card>
                                    ))}

                                    <p className="text-xs text-muted-foreground">
                                        💡 Puedes agregar múltiples franjas para el mismo día (ej: mañana 7-11am, tarde 3-5pm, noche 8-10pm)
                                    </p>
                                </div>

                                {/* Duración por Cita */}
                                <div className="space-y-2">
                                    <Label htmlFor="duracion">Duración por Cita (minutos)</Label>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={decrementDuration}
                                            className="h-10 w-10 p-0"
                                        >
                                            -
                                        </Button>
                                        <Input
                                            id="duracion"
                                            type="number"
                                            value={duracionCita}
                                            onChange={(e) =>
                                                setDuracionCita(Math.max(10, Math.min(120, Number(e.target.value))))
                                            }
                                            min="10"
                                            max="120"
                                            step="5"
                                            className="bg-white text-center"
                                            readOnly
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={incrementDuration}
                                            className="h-10 w-10 p-0"
                                        >
                                            +
                                        </Button>
                                        <span className="text-sm text-muted-foreground ml-2">
                                            (Rango: 10-120 min)
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Esta duración se usará para calcular los slots disponibles para los pacientes
                                    </p>
                                </div>

                                {/* Botones */}
                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleSaveSchedules}
                                        className="flex-1 bg-primary hover:bg-secondary"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Guardar Horarios ({franjas.length} franja{franjas.length > 1 ? "s" : ""})
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={resetForm}
                                        className="border-primary text-primary"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
