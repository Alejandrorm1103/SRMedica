
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Stethoscope, UserCheck, Search, Eye, UserX, Edit, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";
import { statsService, ActiveDoctor, ActivePatient } from "../services/stats.service";
import { DoctorModal } from "./DoctorModal";
import { PatientModal } from "./PatientModal";

interface UserManagementPanelProps {
    onUserDeactivated?: () => void;
    reloadTrigger?: number;
}

export function UserManagementPanel({ onUserDeactivated, reloadTrigger = 0 }: UserManagementPanelProps) {
    const [doctors, setDoctors] = useState<ActiveDoctor[]>([]);
    const [patients, setPatients] = useState<ActivePatient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination states
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [doctorPage, setDoctorPage] = useState(1);
    const [patientPage, setPatientPage] = useState(1);

    useEffect(() => {
        setDoctorPage(1);
        setPatientPage(1);
    }, [searchTerm]);

    const handleItemsPerPageChange = (value: number) => {
        setItemsPerPage(value);
        setDoctorPage(1);
        setPatientPage(1);
    };

    // Modal states
    const [selectedDoctor, setSelectedDoctor] = useState<ActiveDoctor | null>(null);
    const [selectedPatient, setSelectedPatient] = useState<ActivePatient | null>(null);
    const [doctorModalMode, setDoctorModalMode] = useState<"view" | "edit">("view");
    const [patientModalMode, setPatientModalMode] = useState<"view" | "edit">("view");
    const [showDoctorModal, setShowDoctorModal] = useState(false);
    const [showPatientModal, setShowPatientModal] = useState(false);

    // Deactivate dialog states
    const [userToDeactivate, setUserToDeactivate] = useState<{ id: number; name: string; type: 'medico' | 'paciente' } | null>(null);
    const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
    const [isDeactivating, setIsDeactivating] = useState(false);

    const loadActiveUsers = async () => {
        try {
            setIsLoading(true);
            const [activeDoctors, activePatients] = await Promise.all([
                statsService.getActiveDoctors(),
                statsService.getActivePatients(),
            ]);
            setDoctors(activeDoctors);
            setPatients(activePatients);
        } catch (error: any) {
            console.error("Error loading active users:", error);
            toast.error("Error al cargar usuarios activos");
            setDoctors([]);
            setPatients([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadActiveUsers();
    }, [reloadTrigger]);

    const handleDeactivateUser = async () => {
        if (!userToDeactivate) return;
        try {
            setIsDeactivating(true);
            await api.post('/auth/admin/deactivate-user', {
                usuarioId: userToDeactivate.id
            });
            toast.success(`${userToDeactivate.type === 'medico' ? 'Médico' : 'Paciente'} desactivado exitosamente`);
            setShowDeactivateDialog(false);
            setUserToDeactivate(null);
            await loadActiveUsers();
            onUserDeactivated?.();
        } catch (error: any) {
            console.error("Error deactivating user:", error);
            toast.error(error.response?.data?.error?.message || "Error al desactivar usuario");
        } finally {
            setIsDeactivating(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getFullName = (user: ActiveDoctor | ActivePatient) => {
        return `${user.primerNombre} ${user.segundoNombre || ''} ${user.primerApellido} ${user.segundoApellido || ''}`.trim();
    };

    const filterDoctors = (doctors: ActiveDoctor[]) => {
        if (!searchTerm) return doctors;
        const term = searchTerm.toLowerCase();
        return doctors.filter(doctor =>
            getFullName(doctor).toLowerCase().includes(term) ||
            doctor.email?.toLowerCase().includes(term) ||
            doctor.registroProfesional?.toLowerCase().includes(term) ||
            doctor.especialidades?.some(esp => esp.nombre.toLowerCase().includes(term))
        );
    };

    const filterPatients = (patients: ActivePatient[]) => {
        if (!searchTerm) return patients;
        const term = searchTerm.toLowerCase();
        return patients.filter(patient =>
            getFullName(patient).toLowerCase().includes(term) ||
            patient.email?.toLowerCase().includes(term)
        );
    };

    const handleViewDoctor = (doctor: ActiveDoctor) => {
        setSelectedDoctor(doctor);
        setDoctorModalMode("view");
        setShowDoctorModal(true);
    };

    const handleEditDoctor = (doctor: ActiveDoctor) => {
        setSelectedDoctor(doctor);
        setDoctorModalMode("edit");
        setShowDoctorModal(true);
    };

    const handleViewPatient = (patient: ActivePatient) => {
        setSelectedPatient(patient);
        setPatientModalMode("view");
        setShowPatientModal(true);
    };

    const handleEditPatient = (patient: ActivePatient) => {
        setSelectedPatient(patient);
        setPatientModalMode("edit");
        setShowPatientModal(true);
    };

    const handleDeactivateClick = (usuarioId: number, name: string, type: 'medico' | 'paciente') => {
        setUserToDeactivate({ id: usuarioId, name, type });
        setShowDeactivateDialog(true);
    };

    const renderPagination = (totalItems: number, currentPage: number, setPage: (page: any) => void) => {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (totalItems === 0) return null;

        return (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 px-1 gap-4">
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1">
                    <span className="text-sm text-gray-500">Mostrar:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="bg-transparent text-sm focus:outline-none text-gray-700 font-medium cursor-pointer"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>

                <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-500 mr-3">
                        {currentPage} de {totalPages || 1}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setPage(1)} disabled={currentPage === 1} className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setPage((prev: number) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setPage((prev: number) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages} className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };


    const renderDoctorsTable = () => {
        const filteredDoctors = filterDoctors(doctors);
        const currentDoctors = filteredDoctors.slice((doctorPage - 1) * itemsPerPage, doctorPage * itemsPerPage);

        if (filteredDoctors.length === 0) {
            return (
                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
                    <p>{searchTerm ? 'No se encontraron resultados' : 'No hay médicos activos'}</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-blue-50/80 mb-2 border-b border-blue-100">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="font-bold text-[#024b85] pl-6 h-12">Nombre</TableHead>
                                <TableHead className="font-bold text-[#024b85]">Email</TableHead>
                                <TableHead className="font-bold text-[#024b85]">Registro</TableHead>
                                <TableHead className="font-bold text-[#024b85]">Especialidad</TableHead>
                                <TableHead className="font-bold text-[#024b85]">Estado</TableHead>
                                <TableHead className="font-bold text-[#024b85]">Fecha Registro</TableHead>
                                <TableHead className="text-right font-bold text-[#024b85] pr-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentDoctors.map((doctor) => (
                                <TableRow key={`doctor-${doctor.id}`} className="hover:bg-blue-50/30 transition-colors">
                                    <TableCell className="font-medium text-gray-900">{getFullName(doctor)}</TableCell>
                                    <TableCell className="text-gray-500">{doctor.email}</TableCell>
                                    <TableCell className="text-gray-500">{doctor.registroProfesional}</TableCell>
                                    <TableCell>
                                        {doctor.especialidades && doctor.especialidades.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {doctor.especialidades.map((esp) => (
                                                    <Badge key={esp.id} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-100">
                                                        {esp.nombre}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Sin especialidad</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`rounded-full px-3 ${doctor.estado ? "bg-green-100 text-green-700 hover:bg-green-200 border-0" : "bg-gray-100 text-gray-500 hover:bg-gray-200 border-0"}`}>
                                            {doctor.estado ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-500">{formatDate(doctor.fechaCreacion)}</TableCell>
                                    <TableCell className="text-right">
                                        <TooltipProvider>
                                            <div className="flex justify-end gap-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button size="icon" variant="ghost" onClick={() => handleViewDoctor(doctor)} className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-full">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Ver Detalles</p>
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button size="icon" variant="ghost" onClick={() => handleEditDoctor(doctor)} className="h-8 w-8 text-orange-600 hover:bg-orange-50 rounded-full">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Editar</p>
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button size="icon" variant="ghost" onClick={() => handleDeactivateClick(doctor.usuarioId, getFullName(doctor), 'medico')} className="h-8 w-8 text-red-600 hover:bg-red-50 rounded-full">
                                                            <UserX className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Desactivar</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TooltipProvider>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {renderPagination(filteredDoctors.length, doctorPage, setDoctorPage)}
            </div>
        );
    };

    const renderPatientsTable = () => {
        const filteredPatients = filterPatients(patients);
        const currentPatients = filteredPatients.slice((patientPage - 1) * itemsPerPage, patientPage * itemsPerPage);

        if (filteredPatients.length === 0) {
            return (
                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
                    <p>{searchTerm ? 'No se encontraron resultados' : 'No hay pacientes activos'}</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-blue-50/80 mb-2 border-b border-blue-100">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="font-bold text-[#024b85] pl-6 h-12">Nombre</TableHead>
                                <TableHead className="font-bold text-[#024b85]">Email</TableHead>
                                <TableHead className="font-bold text-[#024b85]">Estado</TableHead>
                                <TableHead className="font-bold text-[#024b85]">Fecha Registro</TableHead>
                                <TableHead className="text-right font-bold text-[#024b85] pr-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentPatients.map((patient) => (
                                <TableRow key={`patient-${patient.id}`} className="hover:bg-blue-50/30 transition-colors">
                                    <TableCell className="font-medium text-gray-900">{getFullName(patient)}</TableCell>
                                    <TableCell className="text-gray-500">{patient.email}</TableCell>
                                    <TableCell>
                                        <Badge className={`rounded-full px-3 ${patient.estado ? "bg-green-100 text-green-700 hover:bg-green-200 border-0" : "bg-gray-100 text-gray-500 hover:bg-gray-200 border-0"}`}>
                                            {patient.estado ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-500">{formatDate(patient.fechaCreacion)}</TableCell>
                                    <TableCell className="text-right">
                                        <TooltipProvider>
                                            <div className="flex justify-end gap-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button size="icon" variant="ghost" onClick={() => handleViewPatient(patient)} className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-full">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Ver Detalles</p>
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button size="icon" variant="ghost" onClick={() => handleEditPatient(patient)} className="h-8 w-8 text-orange-600 hover:bg-orange-50 rounded-full">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Editar</p>
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button size="icon" variant="ghost" onClick={() => handleDeactivateClick(patient.usuarioId, getFullName(patient), 'paciente')} className="h-8 w-8 text-red-600 hover:bg-red-50 rounded-full">
                                                            <UserX className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Desactivar</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TooltipProvider>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {renderPagination(filteredPatients.length, patientPage, setPatientPage)}
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

    return (
        <div className="p-6 md:p-8 bg-white rounded-[2rem] shadow-sm border border-slate-100/50">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-slate-100 pb-6">
                <div>
                    <h3 className="text-xl font-bold text-[#024b85] mb-1 flex items-center gap-2">
                        Usuarios Activos
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 rounded-full px-2">
                            {doctors.length + patients.length}
                        </Badge>
                    </h3>
                    <p className="text-gray-500 text-sm">
                        Gestiona la base de datos de usuarios registrados y aprobados.
                    </p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Input
                        placeholder="Buscar por nombre, email, registro..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-gray-50 border-gray-200 rounded-xl focus:bg-white transition-all shadow-sm"
                    />
                </div>
            </div>

            <Tabs defaultValue="doctors" className="w-full">
                <TabsList className="bg-slate-100 p-1 rounded-lg inline-flex items-center mb-6 border border-slate-200">
                    <TabsTrigger
                        value="doctors"
                        className="rounded-md px-6 py-2 text-sm font-medium text-slate-600 data-[state=active]:bg-[#024b85] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all focus:outline-none"
                    >
                        <div className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4" />
                            <span>Médicos ({filterDoctors(doctors).length})</span>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger
                        value="patients"
                        className="rounded-md px-6 py-2 text-sm font-medium text-slate-600 data-[state=active]:bg-[#024b85] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all focus:outline-none"
                    >
                        <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            <span>Pacientes ({filterPatients(patients).length})</span>
                        </div>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="doctors" className="mt-0 outline-none">
                    {renderDoctorsTable()}
                </TabsContent>

                <TabsContent value="patients" className="mt-0 outline-none">
                    {renderPatientsTable()}
                </TabsContent>
            </Tabs>

            {/* Modales */}
            <DoctorModal
                doctor={selectedDoctor}
                isOpen={showDoctorModal}
                onClose={() => { setShowDoctorModal(false); setSelectedDoctor(null); }}
                mode={doctorModalMode}
                onSuccess={loadActiveUsers}
            />
            <PatientModal
                patient={selectedPatient}
                isOpen={showPatientModal}
                onClose={() => { setShowPatientModal(false); setSelectedPatient(null); }}
                mode={patientModalMode}
                onSuccess={loadActiveUsers}
            />

            {/* Dialog de Confirmación */}
            <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
                <DialogContent className="rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <UserX className="h-5 w-5" />
                            Confirmar Desactivación
                        </DialogTitle>
                        <DialogDescription className="pt-4 space-y-4">
                            <p className="text-gray-700">
                                ¿Confirma que desea desactivar al usuario <strong className="text-gray-900">{userToDeactivate?.name}</strong>?
                            </p>
                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-sm text-orange-800">
                                Este usuario perderá el acceso inmediato al sistema, pero sus datos se conservarán.
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 mt-2">
                        <Button variant="outline" onClick={() => setShowDeactivateDialog(false)} disabled={isDeactivating} className="rounded-xl">
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDeactivateUser} disabled={isDeactivating} className="rounded-xl bg-red-600 hover:bg-red-700">
                            {isDeactivating ? "Procesando..." : "Sí, Desactivar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
