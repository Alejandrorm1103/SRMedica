import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, FormEvent } from "react";
import { toast } from "sonner";
import { ROLES_CONFIG, getLoginRoles, RoleType } from "../config/roles.config";
import { ChevronDownIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface UnifiedLoginPageProps {
    onLogin: (email: string, password: string, role: RoleType) => Promise<void>;
    onNavigate: (page: string) => void;
}

export function UnifiedLoginPage({ onLogin, onNavigate }: UnifiedLoginPageProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedRole, setSelectedRole] = useState<RoleType | "">("");
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const availableRoles = getLoginRoles();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!selectedRole) {
            toast.error("Por favor selecciona un tipo de usuario");
            return;
        }

        if (!email || !password) {
            toast.error("Por favor completa todos los campos");
            return;
        }

        setIsLoading(true);
        try {
            await onLogin(email, password, selectedRole);
        } catch (error: any) {
            console.error("Login error:", error);
            toast.error(error?.error?.message || "Error al iniciar sesión");
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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-10 text-left align-middle shadow-xl transition-all">
                                {/* Logo */}
                                <div className="text-center mb-8">
                                    <h1 className="text-5xl font-bold text-blue mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        SRMedica
                                    </h1>
                                    <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Inicia Sesión en tu Cuenta
                                    </h2>
                                </div>

                                <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
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
                                                    {selectedRole ? ROLES_CONFIG[selectedRole].label : "Selecciona tu perfil..."}
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

                                    {/* Correo */}
                                    <div>
                                        <input
                                            type="email"
                                            placeholder="Correo"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border-2 border-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-blue transition-all placeholder-gray-400"
                                            style={{ fontFamily: 'Poppins, sans-serif' }}
                                            required
                                        />
                                    </div>

                                    {/* Contraseña */}
                                    <div>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Contraseña"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full px-4 py-3 bg-white border-2 border-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-blue transition-all placeholder-gray-400 pr-10"
                                                style={{ fontFamily: 'Poppins, sans-serif' }}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                                                ) : (
                                                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Recordarme y Olvidaste contraseña */}
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className="w-4 h-4 text-blue bg-white border-2 border-blue rounded focus:ring-2 focus:ring-blue cursor-pointer"
                                            />
                                            <span className="ml-2 text-sm text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Recordarme
                                            </span>
                                        </label>
                                        <a
                                            href="#"
                                            className="text-sm text-blue hover:underline transition-colors"
                                            style={{ fontFamily: 'Poppins, sans-serif' }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toast.info("Funcionalidad próximamente");
                                            }}
                                        >
                                            ¿Olvidaste la contraseña?
                                        </a>
                                    </div>

                                    {/* Botón Iniciar Sesión */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-blue text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                    >
                                        {isLoading ? "Iniciando..." : "Iniciar Sesión"}
                                    </button>
                                </form>

                                {/* Footer */}
                                <div className="mt-6 flex justify-between items-center text-sm border-t border-gray-200 pt-4">
                                    <button
                                        type="button"
                                        className="text-gray-600 hover:text-blue transition-colors"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                        onClick={() => onNavigate("register")}
                                    >
                                        ¿No tienes cuenta? <span className="font-semibold">Regístrate</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="text-gray-500 hover:text-gray-700 transition-colors"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                        onClick={() => onNavigate("landing")}
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
