import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Card } from "./ui/card";
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
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Save, ArrowLeft, Shield, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { TIPOS_DOCUMENTO, SEXOS } from "../constants/catalogos";
import { administratorService } from "../services/administrator.service";

export function ProfileAdmin() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    const [formData, setFormData] = useState({
        primerNombre: "",
        segundoNombre: "",
        primerApellido: "",
        segundoApellido: "",
        tipoDocumento: "",
        numeroDocumento: "",
        sexo: "",
        fechaNacimiento: "",
        email: "",
        telefono: "",
        direccionLinea1: "",
        ciudad: "",
        departamento: "",
        pais: "",
    });

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setIsLoadingProfile(true);
                const profile = await administratorService.getMyProfile();

                // Función robusta para normalizar valores de catálogo (Código -> ID)
                // Reutilizamos la lógica del Médico para consistencia
                const normalizeCatalogValue = (
                    val: any,
                    catalogo: readonly { id: number; codigo: string }[]
                ) => {
                    if (!val) return "";
                    if (typeof val === 'object' && val.id) return String(val.id);
                    if (typeof val === 'string' && isNaN(Number(val))) {
                        const valLower = val.toLowerCase();
                        const found = catalogo.find(item => item.codigo === valLower);
                        if (found) return String(found.id);
                    }
                    return String(val);
                };

                setFormData({
                    primerNombre: profile.primerNombre || "",
                    segundoNombre: profile.segundoNombre || "",
                    primerApellido: profile.primerApellido || "",
                    segundoApellido: profile.segundoApellido || "",
                    tipoDocumento: normalizeCatalogValue(profile.tipoDocumentoId || profile.tipoDocumento, TIPOS_DOCUMENTO),
                    numeroDocumento: profile.numeroDocumento || "",
                    sexo: normalizeCatalogValue(profile.sexoId || profile.sexo, SEXOS),
                    fechaNacimiento: profile.fechaNacimiento ? profile.fechaNacimiento.split('T')[0] : "",
                    email: user?.email || "",
                    telefono: profile.usuario?.telefono || user?.telefono || "",
                    direccionLinea1: profile.direccionLinea1 || "",
                    ciudad: profile.ciudad || "",
                    departamento: profile.departamento || "",
                    pais: profile.pais || "",
                });
            } catch (error: any) {
                console.error("Error al cargar perfil:", error);
                if (error?.response?.status === 404 || error?.message?.includes("no encontrado")) {
                    toast.info("Perfil no encontrado. Por favor completa tu información.");
                    // Inicializar con valores vacíos
                } else {
                    toast.error(error?.message || "Error al cargar el perfil");
                }
            } finally {
                setIsLoadingProfile(false);
            }
        };

        if (user) {
            loadProfile();
        }
    }, [user]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const updateData = {
                tipo_documento_id: formData.tipoDocumento ? Number(formData.tipoDocumento) : null,
                numero_documento: formData.numeroDocumento || null,
                primer_nombre: formData.primerNombre,
                segundo_nombre: formData.segundoNombre || null,
                primer_apellido: formData.primerApellido,
                segundo_apellido: formData.segundoApellido || null,
                fecha_nacimiento: formData.fechaNacimiento ? new Date(formData.fechaNacimiento).toISOString() : null,
                sexo_id: formData.sexo ? Number(formData.sexo) : null,
                direccion_linea1: formData.direccionLinea1 || null,
                ciudad: formData.ciudad || null,
                departamento: formData.departamento || null,
                pais: formData.pais || null,
            };

            await administratorService.updateMyProfile(updateData);
            toast.success("Perfil actualizado correctamente");
        } catch (error: any) {
            console.error("Error al actualizar perfil:", error);
            toast.error(error?.message || "Error al actualizar el perfil");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingProfile) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const displayName = formData.primerNombre && formData.primerApellido
        ? `Admin. ${formData.primerNombre} ${formData.primerApellido}`
        : "Administrador";

    return (
        <div className="min-h-screen bg-[#f0f9ff] py-12 font-sans">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header de navegación */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/admin/dashboard")}
                            className="bg-white hover:bg-blue-50 text-blue-600 rounded-full p-2 h-10 w-10 shadow-sm border border-blue-100"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-[#024b85] tracking-tight">Mi Perfil</h1>
                            <p className="text-blue-600/80 text-sm">Gestiona tu información personal y de cuenta</p>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Sidebar / Tarjeta de Resumen */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="bg-white rounded-[2rem] p-6 shadow-xl shadow-blue-900/5 border border-blue-100 overflow-hidden relative">
                            {/* Fondo decorativo superior */}
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-blue-500 to-blue-600 opacity-10"></div>

                            <div className="flex flex-col items-center text-center relative z-10 pt-4">
                                <div className="w-28 h-28 bg-white p-1 rounded-full shadow-lg mb-4 ring-4 ring-blue-50">
                                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center">
                                        <Shield className="h-12 w-12 text-blue-600" />
                                    </div>
                                </div>
                                <h2 className="font-bold text-xl text-slate-800 mb-1">
                                    {displayName}
                                </h2>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100/50 text-blue-700 border border-blue-200/50 mb-6">
                                    Administrador del Sistema
                                </span>

                                <div className="w-full space-y-4 border-t border-blue-100 pt-6">
                                    <div className="flex items-center gap-3 text-sm text-blue-700 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <Mail className="h-4 w-4 text-blue-400" />
                                        </div>
                                        <span className="truncate font-medium">{formData.email}</span>
                                    </div>
                                    {formData.telefono && (
                                        <div className="flex items-center gap-3 text-sm text-blue-700 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                <Phone className="h-4 w-4 text-blue-400" />
                                            </div>
                                            <span className="font-medium">{formData.telefono}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Tarjeta de Permisos - Estilo mejorado */}
                        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[2rem] p-6 shadow-lg border-none relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
                                <Shield className="h-5 w-5 text-blue-400" />
                                Tus Permisos
                            </h3>
                            <div className="space-y-3 relative z-10">
                                {[
                                    "Gestión total de usuarios",
                                    "Acceso a métricas globales",
                                    "Configuración del sistema",
                                    "Administración de citas",
                                    "Auditoría de seguridad"
                                ].map((permiso, idx) => (
                                    <div key={idx} className="flex items-center gap-3 text-sm text-slate-300">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                                        <span>{permiso}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Formulario Principal */}
                    <div className="md:col-span-2">
                        <Card className="bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 border border-blue-100 overflow-hidden">
                            <form onSubmit={handleSubmit}>
                                {/* Sección: Info Personal */}
                                <div className="p-8 border-b border-blue-100">
                                    <h3 className="text-lg font-bold text-[#024b85] mb-6 flex items-center gap-2">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <User className="h-5 w-5" />
                                        </div>
                                        Información Personal
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="primerNombre" className="text-blue-900 font-medium">Primer Nombre</Label>
                                                <Input id="primerNombre" name="primerNombre" value={formData.primerNombre} onChange={handleChange} style={{ backgroundColor: '#FFFFFF' }} className="!h-12 !rounded-xl !border-blue-200 focus:!border-blue-400 transition-all font-medium text-blue-900" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="segundoNombre" className="text-blue-900 font-medium">Segundo Nombre</Label>
                                                <Input id="segundoNombre" name="segundoNombre" value={formData.segundoNombre} onChange={handleChange} style={{ backgroundColor: '#FFFFFF' }} className="!h-12 !rounded-xl !border-blue-200 focus:!border-blue-400 transition-all font-medium text-blue-900" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="primerApellido" className="text-blue-900 font-medium">Primer Apellido</Label>
                                                <Input id="primerApellido" name="primerApellido" value={formData.primerApellido} onChange={handleChange} style={{ backgroundColor: '#FFFFFF' }} className="!h-12 !rounded-xl !border-blue-200 focus:!border-blue-400 transition-all font-medium text-blue-900" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="segundoApellido" className="text-blue-900 font-medium">Segundo Apellido</Label>
                                                <Input id="segundoApellido" name="segundoApellido" value={formData.segundoApellido} onChange={handleChange} style={{ backgroundColor: '#FFFFFF' }} className="!h-12 !rounded-xl !border-blue-200 focus:!border-blue-400 transition-all font-medium text-blue-900" />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="tipoDocumento" className="text-blue-900 font-medium">Tipo de Documento</Label>
                                                <Select value={formData.tipoDocumento} onValueChange={(value) => handleSelectChange("tipoDocumento", value)}>
                                                    <SelectTrigger style={{ backgroundColor: '#FFFFFF' }} className="!h-12 !w-full !rounded-xl !border !border-blue-200 focus:!ring-2 focus:!ring-blue-300 focus:!ring-offset-0 transition-all text-blue-900 px-3 flex items-center justify-between">
                                                        <SelectValue placeholder="Seleccione..." />
                                                    </SelectTrigger>
                                                    <SelectContent style={{ backgroundColor: '#FFFFFF' }}>
                                                        {TIPOS_DOCUMENTO.map((tipo) => (
                                                            <SelectItem key={tipo.id} value={String(tipo.id)} className="hover:bg-slate-100">{tipo.nombre}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="numeroDocumento" className="text-blue-900 font-medium">Número de Documento</Label>
                                                <Input id="numeroDocumento" name="numeroDocumento" value={formData.numeroDocumento} onChange={handleChange} style={{ backgroundColor: '#FFFFFF' }} className="!h-12 !rounded-xl !border-blue-200 focus:!border-blue-400 transition-all font-medium text-blue-900" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="sexo" className="text-blue-900 font-medium">Sexo</Label>
                                                <Select value={formData.sexo} onValueChange={(value) => handleSelectChange("sexo", value)}>
                                                    <SelectTrigger style={{ backgroundColor: '#FFFFFF' }} className="!h-12 !w-full !rounded-xl !border !border-blue-200 focus:!ring-2 focus:!ring-blue-300 focus:!ring-offset-0 transition-all text-blue-900 px-3 flex items-center justify-between">
                                                        <SelectValue placeholder="Seleccione..." />
                                                    </SelectTrigger>
                                                    <SelectContent style={{ backgroundColor: '#FFFFFF' }}>
                                                        {SEXOS.map((sexo) => (
                                                            <SelectItem key={sexo.id} value={String(sexo.id)} className="hover:bg-slate-100">{sexo.nombre}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="fechaNacimiento" className="text-blue-900 font-medium">Fecha de Nacimiento</Label>
                                                <Input id="fechaNacimiento" name="fechaNacimiento" type="date" value={formData.fechaNacimiento} onChange={handleChange} style={{ backgroundColor: '#FFFFFF' }} className="!h-12 !rounded-xl !border-blue-200 focus:!border-blue-400 transition-all font-medium text-blue-900" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sección: Contacto */}
                                <div className="p-8 border-b border-blue-100 bg-blue-50/20">
                                    <h3 className="text-lg font-bold text-[#024b85] mb-6 flex items-center gap-2">
                                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        Ubicación y Contacto
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-blue-900 font-medium">Email</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-blue-400" />
                                                    <Input id="email" name="email" value={formData.email} onChange={handleChange} disabled style={{ backgroundColor: '#F3F4F6' }} className="!h-12 !pl-10 !rounded-xl !border-blue-100 !text-slate-500 cursor-not-allowed" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="telefono" className="text-blue-900 font-medium">Teléfono</Label>
                                                <Input id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} style={{ backgroundColor: '#FFFFFF' }} className="!h-12 !rounded-xl !border-blue-200 focus:!border-blue-400 transition-all text-blue-900" placeholder="+57..." />
                                            </div>
                                        </div>
                                        <div className="space-y-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="direccionLinea1" className="text-blue-900 font-medium">Dirección (Línea 1)</Label>
                                                <Input id="direccionLinea1" name="direccionLinea1" value={formData.direccionLinea1} onChange={handleChange} style={{ backgroundColor: '#FFFFFF' }} className="!h-12 !rounded-xl !border-blue-200 focus:!border-blue-400 transition-all text-blue-900" placeholder="Dirección residencial..." />
                                            </div>
                                            <div className="grid md:grid-cols-3 gap-5">
                                                <div className="space-y-2">
                                                    <Label htmlFor="ciudad" className="text-blue-900 font-medium">Ciudad</Label>
                                                    <Input id="ciudad" name="ciudad" value={formData.ciudad} onChange={handleChange} style={{ backgroundColor: '#FFFFFF' }} className="!h-12 !rounded-xl !border-blue-200 focus:!border-blue-400 transition-all text-blue-900" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="departamento" className="text-blue-900 font-medium">Departamento</Label>
                                                    <Input id="departamento" name="departamento" value={formData.departamento} onChange={handleChange} style={{ backgroundColor: '#FFFFFF' }} className="!h-12 !rounded-xl !border-blue-200 focus:!border-blue-400 transition-all text-blue-900" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="pais" className="text-blue-900 font-medium">País</Label>
                                                    <Input id="pais" name="pais" value={formData.pais} onChange={handleChange} style={{ backgroundColor: '#FFFFFF' }} className="!h-12 !rounded-xl !border-blue-200 focus:!border-blue-400 transition-all text-blue-900" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer acciones */}
                                <div className="p-8 bg-blue-50/30 flex justify-end gap-4 rounded-b-[2rem]">
                                    <Button type="button" variant="outline" onClick={() => navigate("/admin/dashboard")} className="h-12 px-6 rounded-xl border-blue-200 text-blue-600 hover:bg-white hover:text-blue-800 hover:border-blue-300">
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={isLoading} className="h-12 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]">
                                        <Save className="h-5 w-5 mr-2" />
                                        {isLoading ? "Guardando..." : "Guardar Cambios"}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
