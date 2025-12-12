import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import api from "../services/api";
import { TIPOS_DOCUMENTO, SEXOS } from "../constants/catalogos";
import { ActiveDoctor } from "../services/stats.service";

interface DoctorModalProps {
    doctor: ActiveDoctor | null;
    isOpen: boolean;
    onClose: () => void;
    mode: "view" | "edit";
    onSuccess?: () => void;
}

interface DoctorProfile {
    primerNombre: string;
    segundoNombre: string;
    primerApellido: string;
    segundoApellido: string;
    tipoDocumento: string;
    numeroDocumento: string;
    fechaNacimiento: string;
    sexo: string;
    telefono: string;
    direccion: string;
    registroProfesional: string;
}

export function DoctorModal({ doctor, isOpen, onClose, mode, onSuccess }: DoctorModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState<DoctorProfile>({
        primerNombre: "",
        segundoNombre: "",
        primerApellido: "",
        segundoApellido: "",
        tipoDocumento: "",
        numeroDocumento: "",
        fechaNacimiento: "",
        sexo: "",
        telefono: "",
        direccion: "",
        registroProfesional: "",
    });

    useEffect(() => {
        if (doctor && isOpen) {
            loadDoctorProfile();
        }
    }, [doctor, isOpen]);

    const loadDoctorProfile = async () => {
        if (!doctor) return;

        try {
            setIsLoading(true);
            const response = await api.get(`/doctors/${doctor.id}`);
            const d = response.data.data;

            setProfile({
                primerNombre: d?.primer_nombre || "",
                segundoNombre: d?.segundo_nombre || "",
                primerApellido: d?.primer_apellido || "",
                segundoApellido: d?.segundo_apellido || "",
                tipoDocumento: d?.tipo_documento || "",
                numeroDocumento: d?.numero_documento || "",
                fechaNacimiento: d?.fecha_nacimiento || "",
                sexo: d?.sexo || "",
                telefono: d?.telefono || "",
                direccion: d?.direccion || "",
                registroProfesional: d?.registro_profesional || "",
            });
        } catch (error: any) {
            console.error("Error loading doctor profile:", error);
            toast.error("Error al cargar el perfil del médico");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: keyof DoctorProfile, value: string) => {
        setProfile((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!doctor) return;

        try {
            setIsSaving(true);
            await api.put(`/doctors/${doctor.id}`, {
                primerNombre: profile.primerNombre,
                segundoNombre: profile.segundoNombre,
                primerApellido: profile.primerApellido,
                segundoApellido: profile.segundoApellido,
                tipoDocumento: profile.tipoDocumento,
                numeroDocumento: profile.numeroDocumento,
                sexo: profile.sexo,
                fechaNacimiento: profile.fechaNacimiento,
                direccion: profile.direccion,
                telefono: profile.telefono,
                registroProfesional: profile.registroProfesional,
            });
            toast.success("Perfil actualizado exitosamente");
            onSuccess?.();
            onClose();
        } catch (error: any) {
            console.error("Error updating doctor:", error);
            toast.error(error.response?.data?.error?.message || "Error al actualizar el perfil");
        } finally {
            setIsSaving(false);
        }
    };

    const isReadOnly = mode === "view";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "view" ? "Ver Perfil de Médico" : "Editar Perfil de Médico"}
                    </DialogTitle>
                    <DialogDescription>
                        {doctor && (
                            <div className="flex items-center gap-2 mt-2">
                                <span className="font-semibold">
                                    {doctor.primerNombre} {doctor.primerApellido}
                                </span>
                                <Badge variant={doctor.estado ? "default" : "secondary"} className={doctor.estado ? "bg-green-500" : "bg-gray-400"}>
                                    {doctor.estado ? "Activo" : "Inactivo"}
                                </Badge>
                                {doctor.especialidades && doctor.especialidades.length > 0 && (
                                    <div className="flex gap-1">
                                        {doctor.especialidades.map((esp) => (
                                            <Badge key={esp.id} variant="outline" className="text-xs">
                                                {esp.nombre}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid gap-6 py-4">
                        {/* Información Personal */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-sm text-primary">Información Personal</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="primerNombre">Primer Nombre *</Label>
                                    <Input
                                        id="primerNombre"
                                        value={profile.primerNombre}
                                        onChange={(e) => handleChange("primerNombre", e.target.value)}
                                        disabled={isReadOnly}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="segundoNombre">Segundo Nombre</Label>
                                    <Input
                                        id="segundoNombre"
                                        value={profile.segundoNombre}
                                        onChange={(e) => handleChange("segundoNombre", e.target.value)}
                                        disabled={isReadOnly}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="primerApellido">Primer Apellido *</Label>
                                    <Input
                                        id="primerApellido"
                                        value={profile.primerApellido}
                                        onChange={(e) => handleChange("primerApellido", e.target.value)}
                                        disabled={isReadOnly}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="segundoApellido">Segundo Apellido</Label>
                                    <Input
                                        id="segundoApellido"
                                        value={profile.segundoApellido}
                                        onChange={(e) => handleChange("segundoApellido", e.target.value)}
                                        disabled={isReadOnly}
                                        className="bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Documento de Identidad */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-sm text-primary">Documento de Identidad</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tipoDocumento">Tipo de Documento *</Label>
                                    <Select
                                        value={profile.tipoDocumento}
                                        onValueChange={(value) => handleChange("tipoDocumento", value)}
                                        disabled={isReadOnly}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Seleccione tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TIPOS_DOCUMENTO.map((tipo) => (
                                                <SelectItem key={tipo.codigo} value={tipo.codigo}>
                                                    {tipo.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="numeroDocumento">Número de Documento *</Label>
                                    <Input
                                        id="numeroDocumento"
                                        value={profile.numeroDocumento}
                                        onChange={(e) => handleChange("numeroDocumento", e.target.value)}
                                        disabled={isReadOnly}
                                        className="bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Información Adicional */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-sm text-primary">Información Adicional</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                                    <Input
                                        id="fechaNacimiento"
                                        type="date"
                                        value={profile.fechaNacimiento}
                                        onChange={(e) => handleChange("fechaNacimiento", e.target.value)}
                                        disabled={isReadOnly}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sexo">Sexo *</Label>
                                    <Select
                                        value={profile.sexo}
                                        onValueChange={(value) => handleChange("sexo", value)}
                                        disabled={isReadOnly}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Seleccione sexo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SEXOS.map((sexo) => (
                                                <SelectItem key={sexo.codigo} value={sexo.codigo}>
                                                    {sexo.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="telefono">Teléfono *</Label>
                                    <Input
                                        id="telefono"
                                        value={profile.telefono}
                                        onChange={(e) => handleChange("telefono", e.target.value)}
                                        disabled={isReadOnly}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="registroProfesional">Registro Profesional *</Label>
                                    <Input
                                        id="registroProfesional"
                                        value={profile.registroProfesional}
                                        onChange={(e) => handleChange("registroProfesional", e.target.value)}
                                        disabled={isReadOnly}
                                        className="bg-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="direccion">Dirección *</Label>
                                <Input
                                    id="direccion"
                                    value={profile.direccion}
                                    onChange={(e) => handleChange("direccion", e.target.value)}
                                    disabled={isReadOnly}
                                    className="bg-white"
                                />
                            </div>
                        </div>

                        {/* Email (solo lectura) */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={doctor?.email || ""}
                                disabled
                                className="bg-gray-100"
                            />
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        {mode === "view" ? "Cerrar" : "Cancelar"}
                    </Button>
                    {mode === "edit" && (
                        <Button onClick={handleSubmit} disabled={isSaving || isLoading}>
                            {isSaving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Guardando...
                                </>
                            ) : (
                                "Guardar Cambios"
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
