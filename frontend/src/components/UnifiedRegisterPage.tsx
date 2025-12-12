import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, FormEvent } from "react";
import { toast } from "sonner";
import { ROLES_CONFIG, getRegisterRoles, RoleType } from "../config/roles.config";
import { TIPOS_DOCUMENTO, SEXOS, ESPECIALIDADES } from "../constants/catalogos";
import { ChevronDownIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface UnifiedRegisterPageProps {
    onRegister: (data: any, role: RoleType) => Promise<void>;
    onNavigate: (page: string) => void;
}

const inputClass = "w-full px-4 py-3 bg-white border-2 border-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-blue transition-all placeholder-gray-400";

export function UnifiedRegisterPage({ onRegister, onNavigate }: UnifiedRegisterPageProps) {
    const [selectedRole, setSelectedRole] = useState<RoleType | "">("");
    const [isLoading, setIsLoading] = useState(false);

    // Dropdown states
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const [isTipoDocDropdownOpen, setIsTipoDocDropdownOpen] = useState(false);
    const [isSexoDropdownOpen, setIsSexoDropdownOpen] = useState(false);
    const [isEspecialidadDropdownOpen, setIsEspecialidadDropdownOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        password: "",
        confirmPassword: "",
        registroProfesional: "",
        especialidadCodigo: "",
        acceptTerms: false,
    });

    const availableRoles = getRegisterRoles();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!selectedRole) {
            toast.error("Por favor selecciona un tipo de usuario");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        if (formData.password.length < 8) {
            toast.error("La contraseña debe tener al menos 8 caracteres");
            return;
        }

        if (!formData.acceptTerms) {
            toast.error("Debes aceptar los términos y condiciones");
            return;
        }

        setIsLoading(true);
        try {
            const selectedTipoDoc = TIPOS_DOCUMENTO.find(t => t.codigo === formData.tipoDocumento);
            const selectedSexo = SEXOS.find(s => s.codigo === formData.sexo);

            const dataToSend = {
                primerNombre: formData.primerNombre,
                segundoNombre: formData.segundoNombre || undefined,
                primerApellido: formData.primerApellido,
                segundoApellido: formData.segundoApellido || undefined,
                tipoDocumentoId: selectedTipoDoc?.id,
                numeroDocumento: formData.numeroDocumento,
                sexoId: selectedSexo?.id,
                fechaNacimiento: formData.fechaNacimiento,
                direccion: "",
                email: formData.email,
                telefono: formData.telefono,
                password: formData.password,
                rol: selectedRole,
                ...(selectedRole === 'medico' && {
                    registroProfesional: formData.registroProfesional,
                    especialidadCodigo: formData.especialidadCodigo,
                }),
            };

            await onRegister(dataToSend, selectedRole);

            setFormData({
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
                password: "",
                confirmPassword: "",
                registroProfesional: "",
                especialidadCodigo: "",
                acceptTerms: false,
            });
            setSelectedRole("");
        } catch (error: any) {
            console.error("Register error:", error);
            toast.error(error?.error?.message || "Error al crear la cuenta");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Transition appear show={true} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={() => { }}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-blue-50/80 backdrop-blur-sm">
                        <div className="absolute inset-0 banner-image opacity-30" style={{ backgroundSize: '500px', backgroundRepeat: 'repeat', backgroundPosition: 'center' }}></div>
                    </div>
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 pt-28 pb-20 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-10 text-left align-middle shadow-xl transition-all max-h-[90vh] min-h-[500px] overflow-y-auto">
                                {/* Logo */}
                                <div className="text-center mb-8">
                                    <h1 className="text-5xl font-bold text-blue mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        SRMedica
                                    </h1>
                                    <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Registre su Cuenta
                                    </h2>
                                </div>

                                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                                    {/* Selector de tipo de usuario - CUSTOM */}
                                    <div>
                                        <label className="block text-sm font-medium text-blue mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Tipo de Usuario
                                        </label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                                                className="w-full px-4 py-3 bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue focus:border-primary transition-all text-left flex items-center justify-between"
                                                style={{ fontFamily: 'Poppins, sans-serif' }}
                                            >
                                                <span className={selectedRole ? "text-gray-700" : "text-gray-400"}>
                                                    {selectedRole ? ROLES_CONFIG[selectedRole].label : "Seleccione su perfil"}
                                                </span>
                                                <ChevronDownIcon className={`h-5 w-5 text-blue transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            {isRoleDropdownOpen && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-400 rounded-lg shadow-lg">
                                                    {availableRoles.map((role) => (
                                                        <button
                                                            key={role}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedRole(role);
                                                                setIsRoleDropdownOpen(false);
                                                            }}
                                                            className="w-full px-4 py-3 text-left hover:bg-blue hover:text-white transition-colors text-gray-700"
                                                            style={{ fontFamily: 'Poppins, sans-serif' }}
                                                        >
                                                            {ROLES_CONFIG[role].label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {selectedRole && (
                                        <>
                                            {/* Nombres */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="text" placeholder="Primer Nombre *" value={formData.primerNombre} onChange={(e) => setFormData({ ...formData, primerNombre: e.target.value })} className={inputClass} style={{ fontFamily: 'Poppins, sans-serif' }} required />
                                                <input type="text" placeholder="Segundo Nombre" value={formData.segundoNombre} onChange={(e) => setFormData({ ...formData, segundoNombre: e.target.value })} className={inputClass} style={{ fontFamily: 'Poppins, sans-serif' }} />
                                            </div>

                                            {/* Apellidos */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="text" placeholder="Primer Apellido *" value={formData.primerApellido} onChange={(e) => setFormData({ ...formData, primerApellido: e.target.value })} className={inputClass} style={{ fontFamily: 'Poppins, sans-serif' }} required />
                                                <input type="text" placeholder="Segundo Apellido" value={formData.segundoApellido} onChange={(e) => setFormData({ ...formData, segundoApellido: e.target.value })} className={inputClass} style={{ fontFamily: 'Poppins, sans-serif' }} />
                                            </div>

                                            {/* Documento */}
                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Tipo Documento - CUSTOM */}
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsTipoDocDropdownOpen(!isTipoDocDropdownOpen)}
                                                        className="w-full px-4 py-3 bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue focus:border-primary transition-all text-left flex items-center justify-between"
                                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                                    >
                                                        <span className={formData.tipoDocumento ? "text-gray-700" : "text-gray-400"}>
                                                            {formData.tipoDocumento
                                                                ? TIPOS_DOCUMENTO.find(t => t.codigo === formData.tipoDocumento)?.nombre
                                                                : "Tipo de Documento *"}
                                                        </span>
                                                        <ChevronDownIcon className={`h-5 w-5 text-blue transition-transform ${isTipoDocDropdownOpen ? 'rotate-180' : ''}`} />
                                                    </button>

                                                    {isTipoDocDropdownOpen && (
                                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-400 rounded-lg shadow-lg">
                                                            {TIPOS_DOCUMENTO.map((tipo) => (
                                                                <button
                                                                    key={tipo.codigo}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFormData({ ...formData, tipoDocumento: tipo.codigo });
                                                                        setIsTipoDocDropdownOpen(false);
                                                                    }}
                                                                    className="w-full px-4 py-3 text-left hover:bg-blue hover:text-white transition-colors text-gray-700"
                                                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                                                >
                                                                    {tipo.nombre}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <input type="text" placeholder="Número de Documento *" value={formData.numeroDocumento} onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })} className={inputClass} style={{ fontFamily: 'Poppins, sans-serif' }} required />
                                            </div>

                                            {/* Sexo y Fecha */}
                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Sexo - CUSTOM */}
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsSexoDropdownOpen(!isSexoDropdownOpen)}
                                                        className="w-full px-4 py-3 bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue focus:border-primary transition-all text-left flex items-center justify-between"
                                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                                    >
                                                        <span className={formData.sexo ? "text-gray-700" : "text-gray-400"}>
                                                            {formData.sexo
                                                                ? SEXOS.find(s => s.codigo === formData.sexo)?.nombre
                                                                : "Seleccione su Sexo *"}
                                                        </span>
                                                        <ChevronDownIcon className={`h-5 w-5 text-blue transition-transform ${isSexoDropdownOpen ? 'rotate-180' : ''}`} />
                                                    </button>

                                                    {isSexoDropdownOpen && (
                                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-400 rounded-lg shadow-lg">
                                                            {SEXOS.map((sexo) => (
                                                                <button
                                                                    key={sexo.codigo}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFormData({ ...formData, sexo: sexo.codigo });
                                                                        setIsSexoDropdownOpen(false);
                                                                    }}
                                                                    className="w-full px-4 py-3 text-left hover:bg-blue hover:text-white transition-colors text-gray-700"
                                                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                                                >
                                                                    {sexo.nombre}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <input type="date" placeholder="Fecha de Nacimiento *" value={formData.fechaNacimiento} onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })} className={`${inputClass} ${formData.fechaNacimiento ? "text-gray-900" : "text-gray-400"}`} style={{ fontFamily: 'Poppins, sans-serif' }} required />
                                            </div>

                                            {/* Email y Teléfono */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="email" placeholder="Correo *" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} style={{ fontFamily: 'Poppins, sans-serif' }} required />
                                                <input type="tel" placeholder="Teléfono *" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} className={inputClass} style={{ fontFamily: 'Poppins, sans-serif' }} required />
                                            </div>

                                            {/* Campos de Médico */}
                                            {selectedRole === 'medico' && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <input type="text" placeholder="Registro Profesional *" value={formData.registroProfesional} onChange={(e) => setFormData({ ...formData, registroProfesional: e.target.value })} className={inputClass} style={{ fontFamily: 'Poppins, sans-serif' }} required />

                                                    {/* Especialidad - CUSTOM */}
                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsEspecialidadDropdownOpen(!isEspecialidadDropdownOpen)}
                                                            className="w-full px-4 py-3 bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue focus:border-primary transition-all text-left flex items-center justify-between"
                                                            style={{ fontFamily: 'Poppins, sans-serif' }}
                                                        >
                                                            <span className={formData.especialidadCodigo ? "text-gray-700" : "text-gray-400"}>
                                                                {formData.especialidadCodigo
                                                                    ? ESPECIALIDADES.find(e => e.codigo === formData.especialidadCodigo)?.nombre
                                                                    : "Especialidad *"}
                                                            </span>
                                                            <ChevronDownIcon className={`h-5 w-5 text-blue transition-transform ${isEspecialidadDropdownOpen ? 'rotate-180' : ''}`} />
                                                        </button>

                                                        {isEspecialidadDropdownOpen && (
                                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-400 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                                {ESPECIALIDADES.map((esp) => (
                                                                    <button
                                                                        key={esp.codigo}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setFormData({ ...formData, especialidadCodigo: esp.codigo });
                                                                            setIsEspecialidadDropdownOpen(false);
                                                                        }}
                                                                        className="w-full px-4 py-3 text-left hover:bg-blue hover:text-white transition-colors text-gray-700"
                                                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                                                    >
                                                                        {esp.nombre}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Contraseñas */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="relative w-full">
                                                    <input type={showPassword ? "text" : "password"} placeholder="Contraseña *" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={inputClass + " pr-10"} style={{ fontFamily: 'Poppins, sans-serif' }} required />
                                                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none" onClick={() => setShowPassword(!showPassword)}>
                                                        {showPassword ? <EyeSlashIcon className="h-5 w-5" aria-hidden="true" /> : <EyeIcon className="h-5 w-5" aria-hidden="true" />}
                                                    </button>
                                                    {formData.password && formData.password.length < 8 && (
                                                        <p className="text-red-500 text-xs mt-1 ml-1 text-left font-medium">Mínimo 8 caracteres</p>
                                                    )}
                                                </div>
                                                <div className="relative w-full">
                                                    <input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        placeholder="Confirmar Contraseña *"
                                                        value={formData.confirmPassword}
                                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                        className={`${inputClass} pr-10 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500 ring-red-500' : ''}`}
                                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                                        required
                                                    />
                                                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                        {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" aria-hidden="true" /> : <EyeIcon className="h-5 w-5" aria-hidden="true" />}
                                                    </button>
                                                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                                        <p className="text-red-500 text-xs mt-1 ml-1 text-left font-medium">No coinciden</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Términos */}
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" id="acceptTerms" checked={formData.acceptTerms} onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })} className="w-4 h-4 text-blue bg-white border-2 border-blue rounded focus:ring-2 focus:ring-blue cursor-pointer" required />
                                                <label htmlFor="acceptTerms" className="text-sm text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    Acepto los términos y condiciones
                                                </label>
                                            </div>

                                            {/* Botón Registrar */}
                                            <button type="submit" disabled={isLoading} className="w-full bg-blue text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {isLoading ? "Registrando..." : "Registrar"}
                                            </button>
                                        </>
                                    )}
                                </form>

                                {/* Footer */}
                                <div className="mt-6 flex justify-between items-center text-sm border-t border-gray-200 pt-4">
                                    <button type="button" className="text-gray-600 hover:text-blue transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }} onClick={() => onNavigate("login")}>
                                        ¿Ya tienes cuenta? <span className="font-semibold">Inicia sesión</span>
                                    </button>
                                    <button type="button" className="text-gray-500 hover:text-gray-700 transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }} onClick={() => onNavigate("landing")}>
                                        Cerrar
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition >
    );
}
