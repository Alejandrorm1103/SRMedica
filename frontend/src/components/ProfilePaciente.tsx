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
import { User, Mail, Phone, MapPin, Save, ArrowLeft, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { TIPOS_DOCUMENTO, SEXOS } from "../constants/catalogos";
import api from "../services/api";

export function ProfilePaciente() {
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
                // Load base user data
                if (user?.email) {
                    setFormData(prev => ({ ...prev, email: user.email }));
                }

                const { data } = await api.get('/patients/me');
                if (data) {
                    const p = data.data;

                    // Función robusta para normalizar valores de catálogo (Código -> ID)
                    const normalizeCatalogValue = (val: any, catalogo: readonly { id: number; codigo: string }[]) => {
                        if (!val) return "";
                        // Si viene un objeto con propiedad id (ej: { id: 1, ... })
                        if (typeof val === 'object' && val.id) return String(val.id);
                        // Si viene el código como string (ej: "cc", "f")
                        if (typeof val === 'string' && isNaN(Number(val))) {
                            const valLower = val.toLowerCase();
                            // Estrategia 1: buscar por codigo
                            let found = catalogo.find(item => item.codigo === valLower);
                            // Estrategia 2: si no encuentra, buscar si el valor coincide con el id string
                            if (!found) {
                                found = catalogo.find(item => String(item.id) === val);
                            }
                            if (found) return String(found.codigo); // NOTA: ProfilePaciente original usaba Codigos, no IDs en el state. Voy a mantener esa lógica o adaptarla.
                            // Reviando ProfileMedico usaba IDs en el value.
                            // Aquí en Paciente, el state original parecía esperar códigos strings si la API devuelve códigos.
                            // PERO TIPOS_DOCUMENTO tiene { id: 1, codigo: 'cc' }.
                            // La API de Pacientes recibe qué?
                            // El submit original mandaba lo que estuviera en el estado.
                            // Voy a asumir que el Select espera la propiedad `value` que coincida con el `value` del SelectItem.
                            // En el código original de ProfilePaciente los SelectItem usaban `value={tipo.codigo}`.
                            // Entonces debo devolver el CÓDIGO.

                            if (found) return found.codigo;
                        }
                        // Si viene número, convertir a codigo
                        if (typeof val === 'number') {
                            const found = catalogo.find(item => item.id === val);
                            if (found) return found.codigo;
                        }
                        return String(val);
                    };

                    // Función específica para ProfilePaciente que usa CODIGOS en los valores, no IDs numéricos
                    // (A diferencia de ProfileMedico que usaba IDs).
                    // Revisando el código original: <SelectItem value={tipo.codigo}>

                    const getCatalogCode = (val: any, catalogo: any[]) => {
                        if (!val) return "";
                        // Si es objeto tipo {id: 1, codigo: 'cc'}
                        if (typeof val === 'object' && val.codigo) return val.codigo;
                        // Si es string 'CC' o 'cc'
                        if (typeof val === 'string') return val.toLowerCase();
                        return String(val);
                    }


                    setFormData(prev => ({
                        ...prev,
                        primerNombre: p?.primer_nombre || prev.primerNombre,
                        segundoNombre: p?.segundo_nombre || "",
                        primerApellido: p?.primer_apellido || prev.primerApellido,
                        segundoApellido: p?.segundo_apellido || "",
                        tipoDocumento: getCatalogCode(p?.tipo_documento, TIPOS_DOCUMENTO),
                        numeroDocumento: p?.numero_documento || "",
                        sexo: getCatalogCode(p?.sexo, SEXOS),
                        fechaNacimiento: p?.fecha_nacimiento ? p.fecha_nacimiento.split('T')[0] : "",
                        telefono: p?.telefono || "",
                        direccionLinea1: p?.direccion || "",
                        ciudad: p?.ciudad || "",
                        departamento: p?.departamento || "",
                        pais: p?.pais || "",
                    }));
                }
            } catch (error) {
                console.error("Error loading profile:", error);
                toast.error("No se pudo cargar la información del perfil.");
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
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.patch('/patients/me', {
                primerNombre: formData.primerNombre,
                segundoNombre: formData.segundoNombre,
                primerApellido: formData.primerApellido,
                segundoApellido: formData.segundoApellido,
                tipoDocumento: formData.tipoDocumento, // Envia codigo (ej: "cc")
                numeroDocumento: formData.numeroDocumento,
                sexo: formData.sexo, // Envia codigo (ej: "m")
                fechaNacimiento: formData.fechaNacimiento,
                direccion: formData.direccionLinea1,
                ciudad: formData.ciudad,
                departamento: formData.departamento,
                pais: formData.pais,
            });
            toast.success("Perfil actualizado correctamente");
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Error al actualizar el perfil.");
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
        ? `${formData.primerNombre} ${formData.primerApellido}`
        : "Paciente";

    return (
        <div className="min-h-screen bg-[#f0f9ff] py-12 font-sans">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header de navegación */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/paciente/home")}
                            className="bg-white hover:bg-blue-50 text-blue-600 rounded-full p-2 h-10 w-10 shadow-sm border border-blue-100"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-[#024b85] tracking-tight">Mi Perfil Personal</h1>
                            <p className="text-blue-600/80 text-sm">Gestiona tu información de contacto y afiliación</p>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* SIDEBAR - Tarjeta de Perfil */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="bg-white rounded-[2rem] p-6 shadow-xl shadow-blue-900/5 border border-blue-100 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-blue-500 to-blue-600 opacity-10"></div>

                            <div className="flex flex-col items-center text-center relative z-10 pt-4">
                                <div className="w-28 h-28 bg-white p-1 rounded-full shadow-lg mb-4 ring-4 ring-blue-50">
                                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center">
                                        <User className="h-12 w-12 text-blue-600" />
                                    </div>
                                </div>
                                <h2 className="font-bold text-xl text-slate-800 mb-1">
                                    {displayName}
                                </h2>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100/50 text-emerald-700 border border-emerald-200/50 mb-6">
                                    Paciente Activo
                                </span>

                                <div className="w-full space-y-4 border-t border-blue-100 pt-6">
                                    <div className="flex items-center gap-3 text-sm text-blue-700 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <Mail className="h-4 w-4 text-blue-400" />
                                        </div>
                                        <span className="truncate font-medium">{formData.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-blue-700 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <Phone className="h-4 w-4 text-blue-400" />
                                        </div>
                                        <span className="truncate font-medium">{formData.telefono || "Sin teléfono"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-blue-700 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <MapPin className="h-4 w-4 text-blue-400" />
                                        </div>
                                        <span className="truncate font-medium">{formData.ciudad || "Sin ubicación"}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[2rem] p-6 shadow-lg border-none relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                Tu cuenta
                            </h3>
                            <div className="space-y-3 relative z-10">
                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                    <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                                    <span>Identidad Verificada</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                    <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                                    <span>Servicios Activos</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* FORMULARIO PRINCIPAL */}
                    <div className="md:col-span-2">
                        <Card className="bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 border border-blue-100 overflow-hidden">
                            <form onSubmit={handleSubmit}>
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

                                        <div className="border-t border-blue-50 my-2"></div>
                                        <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wide">Identificación</h4>

                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="tipoDocumento" className="text-blue-900 font-medium">Tipo de Documento</Label>
                                                <Select value={formData.tipoDocumento} onValueChange={(value) => handleSelectChange("tipoDocumento", value)}>
                                                    <SelectTrigger style={{ backgroundColor: '#FFFFFF' }} className="!h-12 !w-full !rounded-xl !border !border-blue-200 focus:!ring-2 focus:!ring-blue-300 focus:!ring-offset-0 transition-all text-blue-900 px-3 flex items-center justify-between">
                                                        <SelectValue placeholder="Seleccione..." />
                                                    </SelectTrigger>
                                                    <SelectContent style={{ backgroundColor: '#FFFFFF' }}>
                                                        {TIPOS_DOCUMENTO.map((tipo) => (
                                                            <SelectItem key={tipo.id} value={tipo.codigo} className="hover:bg-slate-100">{tipo.nombre}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="numeroDocumento" className="text-blue-900 font-medium">Número de Documento</Label>
                                                <div className="relative">
                                                    <FileText className="absolute left-3 top-3.5 h-4 w-4 text-blue-400" />
                                                    <Input id="numeroDocumento" name="numeroDocumento" value={formData.numeroDocumento} onChange={handleChange} style={{ backgroundColor: '#FFFFFF' }} className="!h-12 !pl-10 !rounded-xl !border-blue-200 focus:!border-blue-400 transition-all font-medium text-blue-900" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="sexo" className="text-blue-900 font-medium">Sexo</Label>
                                                <Select value={formData.sexo} onValueChange={(value) => handleSelectChange("sexo", value)}>
                                                    <SelectTrigger style={{ backgroundColor: '#FFFFFF' }} className="!h-12 !w-full !rounded-xl !border !border-blue-200 focus:!ring-2 focus:!ring-blue-300 focus:!ring-offset-0 transition-all text-blue-900 px-3 flex items-center justify-between">
                                                        <SelectValue placeholder="Seleccione..." />
                                                    </SelectTrigger>
                                                    <SelectContent style={{ backgroundColor: '#FFFFFF' }}>
                                                        {SEXOS.map((sexo) => (
                                                            <SelectItem key={sexo.id} value={sexo.codigo} className="hover:bg-slate-100">{sexo.nombre}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="fechaNacimiento" className="text-blue-900 font-medium">Fecha de Nacimiento</Label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-blue-400" />
                                                    <Input id="fechaNacimiento" name="fechaNacimiento" type="date" value={formData.fechaNacimiento} onChange={handleChange} style={{ backgroundColor: '#FFFFFF' }} className="!h-12 !pl-10 !rounded-xl !border-blue-200 focus:!border-blue-400 transition-all font-medium text-blue-900" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 border-b border-blue-100 bg-blue-50/20">
                                    <h3 className="text-lg font-bold text-[#024b85] mb-6 flex items-center gap-2">
                                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        Datos de Contacto
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="email" className="text-blue-900 font-medium">Correo Electrónico</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-blue-400" />
                                                    <Input id="email" name="email" value={formData.email} onChange={handleChange} disabled style={{ backgroundColor: '#F3F4F6' }} className="!h-12 !pl-10 !rounded-xl !border-blue-100 !text-slate-500 cursor-not-allowed" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="telefono" className="text-blue-900 font-medium">Teléfono</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-3.5 h-4 w-4 text-blue-400" />
                                                    <Input id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} style={{ backgroundColor: '#FFFFFF' }} className="!h-12 !pl-10 !rounded-xl !border-blue-200 focus:!border-blue-400 transition-all text-blue-900" placeholder="+57..." />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="pais" className="text-blue-900 font-medium">País</Label>
                                                <Input id="pais" name="pais" value={formData.pais} onChange={handleChange} style={{ backgroundColor: '#FFFFFF' }} className="!h-12 !rounded-xl !border-blue-200 focus:!border-blue-400 transition-all text-blue-900" />
                                            </div>
                                        </div>
                                        <div className="space-y-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="direccionLinea1" className="text-blue-900 font-medium">Dirección (Línea 1)</Label>
                                                <Input id="direccionLinea1" name="direccionLinea1" value={formData.direccionLinea1} onChange={handleChange} style={{ backgroundColor: '#FFFFFF' }} className="!h-12 !rounded-xl !border-blue-200 focus:!border-blue-400 transition-all text-blue-900" placeholder="Dirección residencia..." />
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-5">
                                                <div className="space-y-2">
                                                    <Label htmlFor="ciudad" className="text-blue-900 font-medium">Ciudad</Label>
                                                    <Input id="ciudad" name="ciudad" value={formData.ciudad} onChange={handleChange} style={{ backgroundColor: '#FFFFFF' }} className="!h-12 !rounded-xl !border-blue-200 focus:!border-blue-400 transition-all text-blue-900" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="departamento" className="text-blue-900 font-medium">Departamento / Estado</Label>
                                                    <Input id="departamento" name="departamento" value={formData.departamento} onChange={handleChange} style={{ backgroundColor: '#FFFFFF' }} className="!h-12 !rounded-xl !border-blue-200 focus:!border-blue-400 transition-all text-blue-900" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 bg-blue-50/30 flex justify-end gap-4 rounded-b-[2rem]">
                                    <Button type="button" variant="outline" onClick={() => navigate("/paciente/home")} className="h-12 px-6 rounded-xl border-blue-200 text-blue-600 hover:bg-white hover:text-blue-800 hover:border-blue-300">
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
