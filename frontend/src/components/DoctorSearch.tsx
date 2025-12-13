import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { useState, useEffect } from "react";
import { Search, User, Calendar, Star } from "lucide-react";
import { toast } from "sonner";
import appointmentsService, { Medico } from "../services/appointments.service";
import { useNavigate } from "react-router-dom";

export function DoctorSearch() {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState<Medico[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<Medico[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSpecialty, setSelectedSpecialty] = useState<number | undefined>();

    useEffect(() => {
        loadDoctors();
    }, []);

    useEffect(() => {
        filterDoctors();
    }, [searchTerm, selectedSpecialty, doctors]);

    const loadDoctors = async () => {
        try {
            setIsLoading(true);
            const data = await appointmentsService.searchDoctors();
            setDoctors(data);
        } catch (error: any) {
            console.error("Error loading doctors:", error);
            toast.error("Error al cargar los médicos");
        } finally {
            setIsLoading(false);
        }
    };

    const filterDoctors = () => {
        let filtered = doctors;

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter((doc) => {
                const fullName = `${doc.primerNombre} ${doc.primerApellido}`.toLowerCase();
                return fullName.includes(term);
            });
        }

        if (selectedSpecialty) {
            filtered = filtered.filter((doc) =>
                doc.especialidades.some((esp) => esp.id === selectedSpecialty)
            );
        }

        setFilteredDoctors(filtered);
    };

    const handleBookAppointment = (doctorId: number) => {
        navigate(`/paciente/book-appointment/${doctorId}`);
    };

    // Obtener todas las especialidades únicas
    const allSpecialties = Array.from(
        new Set(
            doctors.flatMap((doc) => doc.especialidades.map((esp) => JSON.stringify(esp)))
        )
    ).map((esp) => JSON.parse(esp));

    return (
        <div className="flex-1 container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                            <Search className="h-6 w-6" />
                            Buscar Médicos
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Encuentra al médico especialista que necesitas
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => navigate("/paciente/home")}>
                        Volver al Inicio
                    </Button>
                </div>

                {/* Filtros */}
                <Card className="p-6 mb-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Buscar por nombre</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Nombre del médico..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 bg-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Filtrar por especialidad</label>
                            <Select
                                value={selectedSpecialty ? String(selectedSpecialty) : "all"}
                                onValueChange={(value) =>
                                    setSelectedSpecialty(value === "all" ? undefined : Number(value))
                                }
                            >
                                <SelectTrigger className="w-full bg-white">
                                    <SelectValue placeholder="Todas las especialidades" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las especialidades</SelectItem>
                                    {allSpecialties.map((specialty) => (
                                        <SelectItem key={specialty.id} value={String(specialty.id)}>
                                            {specialty.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>

                {/* Lista de Médicos */}
                {isLoading ? (
                    <div className="py-8 text-center text-muted-foreground">
                        Cargando médicos...
                    </div>
                ) : filteredDoctors.length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground">
                        {searchTerm || selectedSpecialty
                            ? "No se encontraron médicos con los criterios de búsqueda"
                            : "No hay médicos disponibles"}
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDoctors.map((doctor) => (
                            <Card key={doctor.id} className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex flex-col h-full">
                                    {/* Avatar y Nombre */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                            <User className="h-8 w-8 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg">
                                                Dr(a). {doctor.primerNombre} {doctor.primerApellido}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Reg. Prof: {doctor.registroProfesional}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Especialidades */}
                                    <div className="mb-4">
                                        <p className="text-sm font-medium mb-2">Especialidades:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {doctor.especialidades.map((esp) => (
                                                <Badge key={esp.id} variant="outline" className="text-xs">
                                                    {esp.nombre}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Resumen */}
                                    {doctor.resumenPerfil && (
                                        <div className="mb-4 flex-1">
                                            <p className="text-sm text-muted-foreground line-clamp-3">
                                                {doctor.resumenPerfil}
                                            </p>
                                        </div>
                                    )}

                                    {/* Rating (placeholder) */}
                                    <div className="flex items-center gap-1 mb-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                            />
                                        ))}
                                        <span className="text-sm text-muted-foreground ml-1">(4.9)</span>
                                    </div>

                                    {/* Contacto */}
                                    <div className="space-y-1 mb-4 text-sm text-muted-foreground">
                                        {doctor.email && (
                                            <p className="truncate">📧 {doctor.email}</p>
                                        )}
                                        {doctor.telefono && (
                                            <p>📱 {doctor.telefono}</p>
                                        )}
                                    </div>

                                    {/* Botón de Agendar */}
                                    <Button
                                        onClick={() => handleBookAppointment(doctor.id)}
                                        className="w-full bg-primary hover:bg-secondary"
                                    >
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Agendar Cita
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Contador */}
                {!isLoading && filteredDoctors.length > 0 && (
                    <div className="mt-6 text-sm text-muted-foreground text-center">
                        Mostrando {filteredDoctors.length} de {doctors.length} médicos
                    </div>
                )}
            </div>
        </div>
    );
}
