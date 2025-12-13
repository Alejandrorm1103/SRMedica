
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { CheckCircle, AlertCircle, User, Mail, Calendar, Stethoscope, UserCheck, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";
import { statsService, PendingDoctor, PendingPatient } from "../services/stats.service";

interface PendingUser {
    id: number;
    usuarioId: number;
    primerNombre: string;
    segundoNombre?: string | null;
    primerApellido: string;
    segundoApellido?: string | null;
    email: string;
    registroProfesional?: string;
    fechaCreacion: string;
    tipo: 'medico' | 'paciente';
}

interface PendingUsersPanelProps {
    onUserActivated?: () => void;
    reloadTrigger?: number;
}

export function PendingUsersPanel({ onUserActivated, reloadTrigger }: PendingUsersPanelProps) {
    const [doctors, setDoctors] = useState<PendingUser[]>([]);
    const [patients, setPatients] = useState<PendingUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activatingId, setActivatingId] = useState<number | null>(null);

    // Pagination states
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [doctorPage, setDoctorPage] = useState(1);
    const [patientPage, setPatientPage] = useState(1);

    const loadPendingUsers = async () => {
        try {
            setIsLoading(true);

            // Cargar médicos y pacientes pendientes
            const [pendingDoctors, pendingPatients] = await Promise.all([
                statsService.getPendingDoctors(),
                statsService.getPendingPatients(),
            ]);

            setDoctors(pendingDoctors.map(d => ({ ...d, tipo: 'medico' as const })));
            setPatients(pendingPatients.map(p => ({ ...p, tipo: 'paciente' as const })));
        } catch (error: any) {
            console.error("Error loading pending users:", error);
            toast.error("Error al cargar usuarios pendientes");
            setDoctors([]);
            setPatients([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPendingUsers();
    }, []);

    useEffect(() => {
        if (reloadTrigger !== undefined && reloadTrigger > 0) {
            loadPendingUsers();
        }
    }, [reloadTrigger]);

    const handleActivate = async (usuarioId: number, userId: number, tipo: 'medico' | 'paciente') => {
        try {
            setActivatingId(userId);

            await api.post('/auth/admin/activate-user', {
                usuarioId: usuarioId
            });

            toast.success(`${tipo === 'medico' ? 'Médico' : 'Paciente'} activado exitosamente`);
            onUserActivated?.();
            await loadPendingUsers();
        } catch (error: any) {
            console.error("Error activating user:", error);
            toast.error(error.response?.data?.error?.message || "Error al activar usuario");
        } finally {
            setActivatingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderUserCard = (user: PendingUser) => (
        <div key={user.id} className="p-5 rounded-2xl bg-white border border-slate-200 border-l-[6px] border-l-blue-500 shadow-sm hover:shadow-lg hover:border-blue-300 hover:bg-blue-50/10 transition-all duration-300 group relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                    {/* Header: Nombre y Badge */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-500">
                            <User className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-gray-800 text-lg">
                            {user.primerNombre} {user.segundoNombre || ''} {user.primerApellido} {user.segundoApellido || ''}
                        </span>
                        <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 bg-amber-50 rounded-full px-3 py-0.5">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pendiente
                        </Badge>
                    </div>

                    {/* Detalles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 ml-0 md:ml-12">
                        {user.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Mail className="h-3.5 w-3.5" />
                                <span>{user.email}</span>
                            </div>
                        )}
                        {user.tipo === 'medico' && user.registroProfesional && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Stethoscope className="h-3.5 w-3.5" />
                                <span>Reg: {user.registroProfesional}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Registrado: {formatDate(user.fechaCreacion)}</span>
                        </div>
                    </div>
                </div>

                {/* Botón de Activar */}
                <div className="flex-shrink-0">
                    <Button
                        onClick={() => handleActivate(user.usuarioId, user.id, user.tipo)}
                        disabled={activatingId === user.id}
                        className="bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl shadow-sm shadow-green-200 px-6"
                    >
                        {activatingId === user.id ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Activando...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Aprobar
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );

    const renderPagination = (
        totalItems: number,
        currentPage: number,
        setPage: (page: number) => void
    ) => {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (totalItems === 0) return null;

        return (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 px-1 gap-4">
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1">
                    <span className="text-sm text-gray-500">Mostrar:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setDoctorPage(1);
                            setPatientPage(1);
                        }}
                        className="bg-transparent text-sm focus:outline-none text-gray-700 font-medium cursor-pointer"
                    >
                        <option value={2}>2</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>

                <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-500 mr-3">
                        {currentPage} de {totalPages || 1}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const totalPending = doctors.length + patients.length;

    if (totalPending === 0) {
        return (
            <div className="p-12 text-center bg-gray-50/50 rounded-2xl">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                    ¡Todo al día!
                </h3>
                <p className="text-gray-500">
                    No hay usuarios pendientes de activación en este momento.
                </p>
            </div>
        );
    }

    // Calcular datos paginados
    const currentDoctors = doctors.slice((doctorPage - 1) * itemsPerPage, doctorPage * itemsPerPage);
    const currentPatients = patients.slice((patientPage - 1) * itemsPerPage, patientPage * itemsPerPage);

    return (
        <div className="p-6 md:p-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-[#024b85] mb-1 flex items-center gap-2">
                        Usuarios Pendientes
                        <Badge className="bg-[#0a8de7] hover:bg-[#0a8de7] text-white border-0 rounded-full px-2">
                            {totalPending}
                        </Badge>
                    </h3>
                    <p className="text-gray-500 text-sm">
                        Revisa y aprueba el acceso a nuevos usuarios.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="doctors" className="w-full">
                <TabsList className="bg-slate-100 p-1 rounded-lg inline-flex items-center mb-6 border border-slate-200">
                    <TabsTrigger
                        value="doctors"
                        className="rounded-md px-6 py-2 text-sm font-medium text-slate-600 data-[state=active]:bg-[#024b85] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all focus:outline-none"
                    >
                        <Stethoscope className="h-4 w-4 mr-2" />
                        Médicos ({doctors.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="patients"
                        className="rounded-md px-6 py-2 text-sm font-medium text-slate-600 data-[state=active]:bg-[#024b85] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all focus:outline-none"
                    >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Pacientes ({patients.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="doctors" className="mt-0 outline-none">
                    {doctors.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
                            <CheckCircle className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                            <p>No hay médicos pendientes</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {currentDoctors.map(renderUserCard)}
                            </div>
                            {renderPagination(doctors.length, doctorPage, setDoctorPage)}
                        </>
                    )}
                </TabsContent>

                <TabsContent value="patients" className="mt-0 outline-none">
                    {patients.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
                            <CheckCircle className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                            <p>No hay pacientes pendientes</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {currentPatients.map(renderUserCard)}
                            </div>
                            {renderPagination(patients.length, patientPage, setPatientPage)}
                        </>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
