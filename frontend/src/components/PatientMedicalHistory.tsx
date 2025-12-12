import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { FileText, Download, Calendar, Activity, Pill, AlertCircle, Eye, Stethoscope, Thermometer, Weight, Ruler } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

// Tipos Mock
interface Historia {
    id: number;
    fecha: string;
    medico: string;
    especialidad: string;
    diagnostico: string;
    tipo: string;
    motivo_consulta?: string;
    enfermedad_actual?: string;
    signos_vitales?: {
        presion: string;
        frecuencia_cardiaca: string;
        temperatura: string;
        peso: string;
        talla: string;
    };
    plan_manejo?: string;
}

export function PatientMedicalHistory() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("historias");
    const [selectedHistory, setSelectedHistory] = useState<Historia | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // MOCK DATA EXPANDIDO
    const historias: Historia[] = [
        {
            id: 1,
            fecha: "2024-10-15",
            medico: "Dr. Juan García",
            especialidad: "Cardiología",
            diagnostico: "Hipertensión controlada",
            tipo: "Consulta General",
            motivo_consulta: "Control rutinario de presión arterial y ajuste de medicación.",
            enfermedad_actual: "Paciente masculino de 45 años con antecedentes de HTA diagnosticada hace 5 años. Refiere sentirse bien, sin cefaleas ni tinitus. Adherencia al tratamiento positiva.",
            signos_vitales: {
                presion: "120/80 mmHg",
                frecuencia_cardiaca: "72 lpm",
                temperatura: "36.5°C",
                peso: "78 kg",
                talla: "175 cm"
            },
            plan_manejo: "1. Continuar con Losartán 50mg cada 12 horas.\n2. Dieta baja en sodio.\n3. Realizar control de perfil lipídico en 3 meses.\n4. Ejercicio aeróbico 30 min diarios."
        },
        {
            id: 2,
            fecha: "2024-09-20",
            medico: "Dra. Laura López",
            especialidad: "Dermatología",
            diagnostico: "Dermatitis de contacto",
            tipo: "Control",
            motivo_consulta: "Erupción cutánea en antebrazo derecho con prurito intenso.",
            enfermedad_actual: "Paciente refiere aparición de lesiones eritematosas tras uso de nueva loción corporal. Prurito 7/10 que aumenta en la noche.",
            signos_vitales: {
                presion: "115/75 mmHg",
                frecuencia_cardiaca: "68 lpm",
                temperatura: "36.8°C",
                peso: "77 kg",
                talla: "175 cm"
            },
            plan_manejo: "1. Suspender uso de loción sospechosa.\n2. Hidrocortisona crema 1% aplicar en zona afectada 2 veces al día por 5 días.\n3. Antihistamínico oral SOS si mucho prurito."
        },
        {
            id: 3,
            fecha: "2024-08-05",
            medico: "Dr. Andrés Manuel",
            especialidad: "Medicina General",
            diagnostico: "Infección Respiratoria Aguda",
            tipo: "Urgencia",
            motivo_consulta: "Fiebre, tos productiva y malestar general de 3 días de evolución.",
            enfermedad_actual: "Cuadro clínico caracterizado por alza térmica no cuantificada, rinorrea hialina y tos con expectoración blanquecina. Niega disnea.",
            signos_vitales: {
                presion: "125/82 mmHg",
                frecuencia_cardiaca: "88 lpm",
                temperatura: "38.5°C",
                peso: "78 kg",
                talla: "175 cm"
            },
            plan_manejo: "1. Acetaminofén 1g cada 8 horas por fiebre.\n2. Abundante hidratación.\n3. Reposo relativo por 48 horas.\n4. Signos de alarma para reconsultar."
        },
        {
            id: 4,
            fecha: "2024-06-12",
            medico: "Dr. Juan García",
            especialidad: "Cardiología",
            diagnostico: "Chequeo Preventivo",
            tipo: "Consulta General",
            motivo_consulta: "Evaluación cardiovascular anual.",
            enfermedad_actual: "Asintomático cardiovascular.",
            signos_vitales: {
                presion: "118/78 mmHg",
                frecuencia_cardiaca: "65 lpm",
                temperatura: "36.2°C",
                peso: "78.5 kg",
                talla: "175 cm"
            },
            plan_manejo: "Electrocardiograma normal. Se felicita al paciente por buenos hábitos."
        }
    ];

    const recetas = [
        {
            id: 1,
            fecha: "2024-10-15",
            medico: "Dr. Juan García",
            especialidad: "Cardiología",
            medicamentos: ["Losartán 50mg - 60 tabletas", "Aspirina 100mg - 30 tabletas"],
            indicaciones: "Tomar una tableta de Losartán cada 12 horas. Aspirina una diaria con el almuerzo.",
            estado: "Activa"
        },
        {
            id: 2,
            fecha: "2024-09-20",
            medico: "Dra. Laura López",
            especialidad: "Dermatología",
            medicamentos: ["Hidrocortisona 1% Crema - 1 tubo", "Loratadina 10mg - 10 tabletas"],
            indicaciones: "Aplicar crema capa fina en lesión. Loratadina 1 tableta si hay picazón.",
            estado: "Vencida"
        },
        {
            id: 3,
            fecha: "2024-08-05",
            medico: "Dr. Andrés Manuel",
            especialidad: "Medicina General",
            medicamentos: ["Acetaminofén 500mg - 20 tabletas", "Suero Oral - 2 sobres"],
            indicaciones: "2 tabletas si fiebre > 38°C.",
            estado: "Vencida"
        }
    ];

    const examenes = [
        {
            id: 101,
            fecha: "2024-10-10",
            tipo: "Electrocardiograma de 12 derivaciones",
            solicitado_por: "Dr. Juan García",
            resultado: "Ritmo sinusal normal. Frecuencia 72 lpm. Sin signos de isquemia.",
            archivo: "ecg_oct2024.pdf"
        },
        {
            id: 102,
            fecha: "2024-09-25",
            tipo: "Perfil Lipídico Completo",
            solicitado_por: "Dr. Juan García",
            resultado: "Colesterol Total: 180 mg/dL (Normal). LDL: 100. HDL: 45. Triglicéridos: 140.",
            archivo: "labs_sep2024.pdf"
        },
        {
            id: 103,
            fecha: "2024-06-12",
            tipo: "Hemograma Completo",
            solicitado_por: "Dr. Andrés Manuel",
            resultado: "Leucocitos normales. Hemoglobina 14.5 g/dL. Plaquetas 250.000.",
            archivo: "hemo_jun2024.pdf"
        }
    ];

    const handleOpenDetail = (historia: Historia) => {
        setSelectedHistory(historia);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                            <Activity className="h-8 w-8 text-primary" />
                            Historial Médico
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Consulta tus antecedentes clínicos, recetas y resultados de exámenes.
                        </p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <Button variant="default" className="bg-primary hover:bg-primary/90" onClick={() => window.print()}>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar Resumen
                        </Button>
                        <Button variant="outline" onClick={() => navigate("/paciente/home")} className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700">
                            Volver al Inicio
                        </Button>
                    </div>
                </div>

                {/* Contenido Principal */}
                <Card className="p-6 bg-white shadow-sm border-slate-200">
                    <Tabs defaultValue="historias" className="w-full" onValueChange={setActiveTab}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <TabsList className="grid w-full grid-cols-3 md:w-[400px] bg-slate-100 p-1 rounded-lg">
                                <TabsTrigger value="historias" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-medium">Historias Clínicas</TabsTrigger>
                                <TabsTrigger value="recetas" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-medium">Recetas</TabsTrigger>
                                <TabsTrigger value="examenes" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-medium">Exámenes</TabsTrigger>
                            </TabsList>

                            <div className="text-sm text-muted-foreground hidden md:block">
                                Mostrando últimos {activeTab === "historias" ? historias.length : activeTab === "recetas" ? recetas.length : examenes.length} registros
                            </div>
                        </div>

                        {/* TAB: HISTORIAS CLÍNICAS */}
                        <TabsContent value="historias" className="space-y-4">
                            {historias.map((historia) => (
                                <div key={historia.id} className="border border-slate-100 rounded-xl p-5 hover:bg-slate-50 hover:border-slate-300 transition-all flex flex-col md:flex-row justify-between group bg-white shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-800 mb-1">{historia.diagnostico}</h3>
                                            <div className="flex flex-wrap gap-2 mb-2 text-sm text-muted-foreground">
                                                <span className="font-medium text-slate-700">{historia.medico}</span>
                                                <span className="text-slate-300">•</span>
                                                <span>{historia.especialidad}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">{historia.tipo}</Badge>
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" /> {historia.fecha}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 md:mt-0 md:self-center">
                                        <Button
                                            variant="outline"
                                            className="w-full md:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                            onClick={() => handleOpenDetail(historia)}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            Ver detalle
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>

                        {/* TAB: RECETAS */}
                        <TabsContent value="recetas" className="space-y-4">
                            {recetas.map((receta) => (
                                <div key={receta.id} className="border border-slate-100 rounded-xl p-5 hover:bg-slate-50 transition-all group bg-white shadow-sm">
                                    <div className="flex flex-col md:flex-row justify-between">
                                        <div className="flex items-start gap-4 mb-4 md:mb-0">
                                            <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                                <Pill className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-semibold text-slate-800">Receta Médica</h3>
                                                    <Badge variant="outline" className={`${receta.estado === 'Activa' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-slate-500 bg-slate-100'} text-xs uppercase tracking-wider`}>
                                                        {receta.estado}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-1 mb-2">
                                                    {receta.medicamentos.map((med, idx) => (
                                                        <p key={idx} className="text-sm font-medium text-slate-700">• {med}</p>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-2">
                                                    {receta.medico} • {receta.especialidad} • {receta.fecha}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="self-start text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                                            <Download className="h-4 w-4 mr-1" /> Descargar PDF
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>

                        {/* TAB: EXÁMENES */}
                        <TabsContent value="examenes" className="space-y-4">
                            {examenes.map((examen) => (
                                <div key={examen.id} className="border border-slate-100 rounded-xl p-5 hover:bg-slate-50 transition-all bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
                                    <div className="flex items-start gap-4 mb-4 md:mb-0">
                                        <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                            <Activity className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-800 mb-1">{examen.tipo}</h3>
                                            <p className="text-sm text-slate-600 mb-2 max-w-2xl text-pretty">
                                                Resultado: <span className="font-medium text-slate-900">{examen.resultado}</span>
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {examen.fecha} • Solicitado por: {examen.solicitado_por}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                                        <Download className="h-4 w-4 mr-1" /> Resultado
                                    </Button>
                                </div>
                            ))}
                        </TabsContent>

                    </Tabs>
                </Card>
            </div>

            {/* MODAL DE DETALLE DE HISTORIA CLÍNICA */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-4 border-b bg-slate-50/50">
                        <DialogTitle className="text-2xl flex items-center gap-2">
                            <FileText className="h-6 w-6 text-primary" />
                            Detalle de Historia Clínica
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 flex items-center gap-2 mt-2 text-sm">
                            <span>{selectedHistory?.fecha}</span>
                            <span>•</span>
                            <span className="font-medium text-slate-700">{selectedHistory?.medico}</span>
                            <span>({selectedHistory?.especialidad})</span>
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="flex-1 p-6 overflow-y-auto">
                        <div className="space-y-8">

                            {/* Sección 1: Diagnóstico */}
                            <section className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                <h4 className="text-sm uppercase tracking-wider font-bold text-blue-900 mb-2">Diagnóstico Principal</h4>
                                <p className="text-lg font-medium text-slate-900">{selectedHistory?.diagnostico}</p>
                                <Badge variant="outline" className="mt-2 bg-white border-blue-200 text-blue-700">{selectedHistory?.tipo}</Badge>
                            </section>

                            {/* Sección 2: Motivo y Enfermedad */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <section>
                                    <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-slate-400" /> Motivo de Consulta
                                    </h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">{selectedHistory?.motivo_consulta || "No registrado."}</p>
                                </section>
                                <section>
                                    <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-slate-400" /> Enfermedad Actual
                                    </h4>
                                    <p className="text-slate-600 text-sm leading-relaxed text-justify">{selectedHistory?.enfermedad_actual || "Sin descripción detallada."}</p>
                                </section>
                            </div>

                            {/* Sección 3: Signos Vitales */}
                            <section className="border-y py-6">
                                <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4 text-slate-400" /> Signos Vitales (Al ingreso)
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div className="bg-slate-50 p-3 rounded text-center">
                                        <p className="text-xs text-slate-500 mb-1">Presión Arterial</p>
                                        <p className="font-semibold text-slate-900">{selectedHistory?.signos_vitales?.presion || "--"}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded text-center">
                                        <p className="text-xs text-slate-500 mb-1">Frecuencia C.</p>
                                        <p className="font-semibold text-slate-900">{selectedHistory?.signos_vitales?.frecuencia_cardiaca || "--"}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded text-center">
                                        <p className="text-xs text-slate-500 mb-1 flex items-center justify-center gap-1"><Thermometer className="h-3 w-3" /> Temp.</p>
                                        <p className="font-semibold text-slate-900">{selectedHistory?.signos_vitales?.temperatura || "--"}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded text-center">
                                        <p className="text-xs text-slate-500 mb-1 flex items-center justify-center gap-1"><Weight className="h-3 w-3" /> Peso</p>
                                        <p className="font-semibold text-slate-900">{selectedHistory?.signos_vitales?.peso || "--"}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded text-center">
                                        <p className="text-xs text-slate-500 mb-1 flex items-center justify-center gap-1"><Ruler className="h-3 w-3" /> Talla</p>
                                        <p className="font-semibold text-slate-900">{selectedHistory?.signos_vitales?.talla || "--"}</p>
                                    </div>
                                </div>
                            </section>

                            {/* Sección 4: Plan de Manejo */}
                            <section>
                                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                    <Pill className="h-4 w-4 text-slate-400" /> Plan de Manejo y Tratamiento
                                </h4>
                                <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 text-sm md:text-base text-slate-700 whitespace-pre-line leading-relaxed">
                                    {selectedHistory?.plan_manejo || "No se registraron indicaciones específicas."}
                                </div>
                            </section>

                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cerrar</Button>
                        <Button className="bg-primary text-white hover:bg-primary/90">
                            <Download className="mr-2 h-4 w-4" /> Descargar PDF
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function EmptyState({ title, description }: { title: string, description: string }) {
    return (
        <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
            <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">{description}</p>
        </div>
    );
}
