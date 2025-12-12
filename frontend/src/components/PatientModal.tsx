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
import { ActivePatient } from "../services/stats.service";

interface PatientModalProps {
    patient: ActivePatient | null;
    isOpen: boolean;
    onClose: () => void;
    mode: "view" | "edit";
    onSuccess?: () => void;
}

interface PatientProfile {
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
}

export function PatientModal({ patient, isOpen, onClose, mode, onSuccess }: PatientModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState<PatientProfile>({
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
    });

    useEffect(() => {
        if (patient && isOpen) {
            loadPatientProfile();
        }
    }, [patient, isOpen]);

    const loadPatientProfile = async () => {
        if (!patient) return;

        try {
            setIsLoading(true);
            const response = await api.get(`/patients/${patient.id}`);
            const p = response.data.data;

            setProfile({
                primerNombre: p?.primer_nombre || "",
                segundoNombre: p?.segundo_nombre || "",
                primerApellido: p?.primer_apellido || "",
                segundoApellido: p?.segundo_apellido || "",
                tipoDocumento: p?.tipo_documento || "",
                numeroDocumento: p?.numero_documento || "",
                fechaNacimiento: p?.fecha_nacimiento || "",
                sexo: p?.sexo || "",
                telefono: p?.telefono || "",
                direccion: p?.direccion || "",
            });
        } catch (error: any) {
            console.error("Error loading patient profile:", error);
            toast.error("Error al cargar el perfil del paciente");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: keyof PatientProfile, value: string) => {
        setProfile((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!patient) return;

        try {
            setIsSaving(true);
            await api.put(`/patients/${patient.id}`, {
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
            });
            toast.success("Perfil actualizado exitosamente");
            onSuccess?.();
            onClose();
        } catch (error: any) {
            console.error("Error updating patient:", error);
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
                        {mode === "view" ? "Ver Perfil de Paciente" : "Editar Perfil de Paciente"}
                    </DialogTitle>
                    <DialogDescription>
                        {patient && (
                            <div className="flex items-center gap-2 mt-2">
                                <span className="font-semibold">
                                    {patient.primerNombre} {patient.primerApellido}
                                </span>
                                <Badge variant={patient.estado ? "default" : "secondary"} className={patient.estado ? "bg-green-500" : "bg-gray-400"}>
                                    {patient.estado ? "Activo" : "Inactivo"}
                                </Badge>
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
                                value={patient?.email || ""}
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
