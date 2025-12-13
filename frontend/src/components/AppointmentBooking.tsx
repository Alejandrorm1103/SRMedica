import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, User, ArrowLeft, CheckCircle, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import appointmentsService, { Medico, Horario } from "../services/appointments.service";
import { useNavigate, useParams } from "react-router-dom";
import { format, addDays, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "../context/AuthContext";
import { Calendar } from "./ui/calendar";

export function AppointmentBooking() {
    const navigate = useNavigate();
    const { doctorId } = useParams<{ doctorId: string }>();
    const { user } = useAuth();

    const [doctor, setDoctor] = useState<Medico | null>(null);
    const [availability, setAvailability] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBooking, setIsBooking] = useState(false);

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<{ inicio: string; fin: string } | null>(null);
    const [motivo, setMotivo] = useState("");

    useEffect(() => {
        if (doctorId) {
            loadDoctorInfo();
        }
    }, [doctorId]);

    useEffect(() => {
        if (doctorId && selectedDate) {
            loadAvailability();
        }
    }, [doctorId, selectedDate]);

    const loadDoctorInfo = async () => {
        if (!doctorId) return;

        try {
            setIsLoading(true);
            const data = await appointmentsService.getDoctorDetails(Number(doctorId));
            setDoctor(data);
            // Seleccionar automáticamente mañana como fecha inicial
            setSelectedDate(addDays(startOfDay(new Date()), 1));
        } catch (error: any) {
            console.error("Error loading doctor:", error);
            toast.error("Error al cargar información del médico");
        } finally {
            setIsLoading(false);
        }
    };

    const loadAvailability = async () => {
        if (!doctorId || !selectedDate) return;

        try {
            const startDate = format(selectedDate, "yyyy-MM-dd");
            const endDate = format(addDays(selectedDate, 1), "yyyy-MM-dd");

            const data = await appointmentsService.getAvailability(
                Number(doctorId),
                startDate,
                endDate
            );
            setAvailability(data);
        } catch (error: any) {
            console.error("Error loading availability:", error);
            toast.error("Error al cargar disponibilidad");
        }
    };

    const handleBookAppointment = async () => {
        if (!selectedSlot || !doctorId || !user || !selectedDate) {
            toast.error("Por favor completa todos los campos");
            return;
        }

        try {
            setIsBooking(true);
            await appointmentsService.bookAppointment({
                medicoId: Number(doctorId),
                inicio: selectedSlot.inicio,
                fin: selectedSlot.fin,
                motivo,
            });

            toast.success("¡Cita agendada exitosamente!");
            navigate("/paciente/appointments");
        } catch (error: any) {
            console.error("Error booking appointment:", error);
            toast.error(error.response?.data?.error?.message || "Error al agendar la cita");
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <div className="flex-1 container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/paciente/doctors")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                            <CalendarIcon className="h-6 w-6" />
                            Agendar Cita
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Selecciona fecha y hora para tu cita
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-8 text-center text-muted-foreground">
                        Cargando información...
                    </div>
                ) : !doctor ? (
                    <Card className="p-8 text-center text-muted-foreground">
                        Médico no encontrado
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {/* Información del Médico */}
                        <Card className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="h-8 w-8 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">
                                        Dr(a). {doctor.primerNombre} {doctor.primerApellido}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Reg. Prof: {doctor.registroProfesional}
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {doctor.especialidades?.map((esp) => (
                                            <Badge key={esp.id} variant="outline" className="text-xs">
                                                {esp.nombre}
                                            </Badge>
                                        )) || <span className="text-xs text-muted-foreground">Sin especialidades</span>}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Selección de Fecha */}
                        <Card className="p-6">
                            <h3 className="font-semibold mb-6 flex items-center gap-2 text-lg">
                                <CalendarIcon className="h-6 w-6 text-primary" />
                                Selecciona una fecha
                            </h3>
                            <div className="w-full overflow-hidden rounded-lg border bg-white shadow-sm">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate || undefined}
                                    onSelect={(date) => {
                                        setSelectedDate(date || null);
                                        setSelectedSlot(null);
                                    }}
                                    disabled={(date) => date < startOfDay(new Date())}
                                    className="w-full p-0"
                                    classNames={{
                                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                                        month: "space-y-4 w-full",
                                        caption: "flex justify-center pt-4 relative items-center mb-4",
                                        caption_label: "text-xl font-bold text-gray-900 capitalize",
                                        nav: "space-x-1 flex items-center",
                                        nav_button: "border border-gray-100 hover:bg-gray-100 hover:text-gray-900 h-10 w-10 bg-transparent p-0 opacity-50 hover:opacity-100 transition-all rounded-full flex items-center justify-center",
                                        nav_button_previous: "absolute left-4",
                                        nav_button_next: "absolute right-4",
                                        table: "w-full border-collapse space-y-1",
                                        head_row: "flex w-full border-b mb-2",
                                        head_cell: "text-muted-foreground w-full font-medium text-sm py-4 flex items-center justify-center uppercase tracking-widest",
                                        row: "flex w-full mt-2",
                                        cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 w-full h-16 sm:h-20 border-r border-t border-transparent first:border-l-0 hover:bg-slate-50 transition-colors",
                                        day: "h-full w-full p-0 font-normal aria-selected:opacity-100 flex items-center justify-center text-lg rounded-md hover:bg-primary/10 transition-all",
                                        day_selected: "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white font-bold shadow-lg scale-90 rounded-xl",
                                        day_today: "bg-slate-100 text-slate-900 font-bold border border-slate-200",
                                        day_outside: "text-muted-foreground opacity-30",
                                        day_disabled: "text-muted-foreground opacity-20 cursor-not-allowed bg-slate-50",
                                        day_hidden: "invisible",
                                    }}
                                    locale={es}
                                />
                            </div>
                        </Card>

                        {/* Selección de Hora */}
                        {selectedDate && (
                            <Card className="p-6">
                                <h3 className="font-semibold mb-6 flex items-center gap-2 text-lg">
                                    <Clock className="h-6 w-6 text-primary" />
                                    Horarios disponibles
                                </h3>
                                {availability.length === 0 ? (
                                    <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed text-muted-foreground">
                                        <p>No hay horarios disponibles para esta fecha.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {/* Mañana */}
                                        {availability.some(slot => new Date(slot.horario.inicio).getHours() < 12) && (
                                            <div>
                                                <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                                                    <Sun className="h-4 w-4" /> Mañana
                                                </h4>
                                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                    {availability
                                                        .filter(slot => new Date(slot.horario.inicio).getHours() < 12)
                                                        .map((slot, index) => {
                                                            const inicio = new Date(slot.horario.inicio);
                                                            const isSelected = selectedSlot?.inicio === slot.horario.inicio;
                                                            const isOccupied = slot.ocupado;

                                                            return (
                                                                <Button
                                                                    key={`am-${index}`}
                                                                    variant={isSelected ? "default" : "outline"}
                                                                    disabled={isOccupied}
                                                                    onClick={() => !isOccupied && setSelectedSlot({
                                                                        inicio: slot.horario.inicio,
                                                                        fin: slot.horario.fin,
                                                                    })}
                                                                    className={`
                                                                        relative h-16 px-2 flex flex-col items-center justify-center gap-1 transition-all duration-200
                                                                        ${isSelected ? 'ring-2 ring-primary ring-offset-2 scale-105 shadow-md' : 'hover:border-primary/50 hover:bg-primary/5'}
                                                                        ${isOccupied ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed hover:bg-slate-100 hover:border-slate-200' : ''}
                                                                    `}
                                                                >
                                                                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : isOccupied ? 'text-slate-400' : 'text-slate-700'}`}>
                                                                        {format(inicio, "HH:mm")}
                                                                    </span>
                                                                    {isOccupied && (
                                                                        <span className="text-[10px] font-medium text-slate-400 bg-slate-200/50 px-1.5 py-0.5 rounded-full">
                                                                            Reservado
                                                                        </span>
                                                                    )}
                                                                </Button>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Tarde */}
                                        {availability.some(slot => {
                                            const h = new Date(slot.horario.inicio).getHours();
                                            return h >= 12 && h < 18;
                                        }) && (
                                                <div>
                                                    <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                                                        <Sun className="h-4 w-4" /> Tarde
                                                    </h4>
                                                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                        {availability
                                                            .filter(slot => {
                                                                const h = new Date(slot.horario.inicio).getHours();
                                                                return h >= 12 && h < 18;
                                                            })
                                                            .map((slot, index) => {
                                                                const inicio = new Date(slot.horario.inicio);
                                                                const isSelected = selectedSlot?.inicio === slot.horario.inicio;
                                                                const isOccupied = slot.ocupado;

                                                                return (
                                                                    <Button
                                                                        key={`pm-${index}`}
                                                                        variant={isSelected ? "default" : "outline"}
                                                                        disabled={isOccupied}
                                                                        onClick={() => !isOccupied && setSelectedSlot({
                                                                            inicio: slot.horario.inicio,
                                                                            fin: slot.horario.fin,
                                                                        })}
                                                                        className={`
                                                                        relative h-16 px-2 flex flex-col items-center justify-center gap-1 transition-all duration-200
                                                                        ${isSelected ? 'ring-2 ring-primary ring-offset-2 scale-105 shadow-md' : 'hover:border-primary/50 hover:bg-primary/5'}
                                                                        ${isOccupied ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed hover:bg-slate-100 hover:border-slate-200' : ''}
                                                                    `}
                                                                    >
                                                                        <span className={`text-sm font-bold ${isSelected ? 'text-white' : isOccupied ? 'text-slate-400' : 'text-slate-700'}`}>
                                                                            {format(inicio, "HH:mm")}
                                                                        </span>
                                                                        {isOccupied && (
                                                                            <span className="text-[10px] font-medium text-slate-400 bg-slate-200/50 px-1.5 py-0.5 rounded-full">
                                                                                Reservado
                                                                            </span>
                                                                        )}
                                                                    </Button>
                                                                );
                                                            })}
                                                    </div>
                                                </div>
                                            )}

                                        {/* Noche */}
                                        {availability.some(slot => new Date(slot.horario.inicio).getHours() >= 18) && (
                                            <div>
                                                <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                                                    <Moon className="h-4 w-4" /> Noche
                                                </h4>
                                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                    {availability
                                                        .filter(slot => new Date(slot.horario.inicio).getHours() >= 18)
                                                        .map((slot, index) => {
                                                            const inicio = new Date(slot.horario.inicio);
                                                            const isSelected = selectedSlot?.inicio === slot.horario.inicio;
                                                            const isOccupied = slot.ocupado;

                                                            return (
                                                                <Button
                                                                    key={`night-${index}`}
                                                                    variant={isSelected ? "default" : "outline"}
                                                                    disabled={isOccupied}
                                                                    onClick={() => !isOccupied && setSelectedSlot({
                                                                        inicio: slot.horario.inicio,
                                                                        fin: slot.horario.fin,
                                                                    })}
                                                                    className={`
                                                                        relative h-16 px-2 flex flex-col items-center justify-center gap-1 transition-all duration-200
                                                                        ${isSelected ? 'ring-2 ring-primary ring-offset-2 scale-105 shadow-md' : 'hover:border-primary/50 hover:bg-primary/5'}
                                                                        ${isOccupied ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed hover:bg-slate-100 hover:border-slate-200' : ''}
                                                                    `}
                                                                >
                                                                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : isOccupied ? 'text-slate-400' : 'text-slate-700'}`}>
                                                                        {format(inicio, "HH:mm")}
                                                                    </span>
                                                                    {isOccupied && (
                                                                        <span className="text-[10px] font-medium text-slate-400 bg-slate-200/50 px-1.5 py-0.5 rounded-full">
                                                                            Reservado
                                                                        </span>
                                                                    )}
                                                                </Button>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* Motivo de la Consulta */}
                        {selectedSlot && (
                            <Card className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="motivo">Motivo de la consulta (opcional)</Label>
                                        <Textarea
                                            id="motivo"
                                            value={motivo}
                                            onChange={(e) => setMotivo(e.target.value)}
                                            placeholder="Describe brevemente el motivo de tu consulta..."
                                            className="bg-white mt-2"
                                            rows={4}
                                        />
                                    </div>

                                    {/* Resumen */}
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <h4 className="font-semibold text-blue-900 mb-2">Resumen de tu cita:</h4>
                                        <div className="space-y-1 text-sm text-blue-800">
                                            <p>
                                                <strong>Médico:</strong> Dr(a). {doctor.primerNombre}{" "}
                                                {doctor.primerApellido}
                                            </p>
                                            <p>
                                                <strong>Fecha:</strong>{" "}
                                                {selectedDate && format(selectedDate, "PPP", { locale: es })}
                                            </p>
                                            <p>
                                                <strong>Hora:</strong>{" "}
                                                {format(new Date(selectedSlot.inicio), "HH:mm")} -{" "}
                                                {format(new Date(selectedSlot.fin), "HH:mm")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Botón de Confirmar */}
                                    <Button
                                        onClick={handleBookAppointment}
                                        disabled={isBooking}
                                        className="w-full bg-primary hover:bg-secondary"
                                        size="lg"
                                    >
                                        <CheckCircle className="h-5 w-5 mr-2" />
                                        {isBooking ? "Agendando..." : "Confirmar Cita"}
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
