import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    PhoneOff,
    Monitor,
    ArrowLeft,
    MessageSquare,
} from "lucide-react";

interface VideollamadaPageProps {
    userType: "medico" | "paciente";
    onNavigate: (page: string) => void;
}

export function VideollamadaPage({
    userType,
    onNavigate,
}: VideollamadaPageProps) {
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [inCall, setInCall] = useState(false);

    const handleEndCall = () => {
        setInCall(false);
        onNavigate(userType === "medico" ? "home-medico" : "home-paciente");
    };

    return (
        <div className="flex-1">
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => onNavigate(userType === "medico" ? "home-medico" : "home-paciente")}
                            variant="ghost"
                            size="sm"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                        <h2 className="text-primary">Videollamada</h2>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {!inCall ? (
                        /* Sala de espera */
                        <Card className="p-8">
                            <div className="text-center mb-8">
                                <h3 className="mb-2 text-primary">
                                    Sala de Videoconsulta
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Prepárate antes de unirte a la llamada
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <div className="aspect-video bg-gray-900 rounded-lg mb-4 relative overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
                                                <span className="text-2xl text-white">TÚ</span>
                                            </div>
                                        </div>
                                        {!videoEnabled && (
                                            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
                                                Cámara desactivada
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-center gap-4">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            onClick={() => setVideoEnabled(!videoEnabled)}
                                            className={
                                                !videoEnabled ? "bg-destructive text-white" : ""
                                            }
                                        >
                                            {videoEnabled ? (
                                                <Video className="h-5 w-5" />
                                            ) : (
                                                <VideoOff className="h-5 w-5" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            onClick={() => setAudioEnabled(!audioEnabled)}
                                            className={
                                                !audioEnabled ? "bg-destructive text-white" : ""
                                            }
                                        >
                                            {audioEnabled ? (
                                                <Mic className="h-5 w-5" />
                                            ) : (
                                                <MicOff className="h-5 w-5" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="mb-4">Detalles de la Consulta</h4>
                                    <Card className="p-4 mb-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    {userType === "medico" ? "Paciente" : "Médico"}:
                                                </span>
                                                <span className="text-sm">
                                                    {userType === "medico"
                                                        ? "María González"
                                                        : "Dr. Carlos Ramírez"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Fecha:
                                                </span>
                                                <span className="text-sm">15 Nov 2025</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Hora:
                                                </span>
                                                <span className="text-sm">10:00 AM</span>
                                            </div>
                                        </div>
                                    </Card>

                                    <Button
                                        onClick={() => setInCall(true)}
                                        className="w-full bg-primary hover:bg-secondary mb-3"
                                        size="lg"
                                    >
                                        <Video className="h-5 w-5 mr-2" />
                                        Unirse a la Llamada
                                    </Button>

                                    <p className="text-xs text-center text-muted-foreground">
                                        Asegúrate de que tu cámara y micrófono estén funcionando
                                        correctamente
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        /* En llamada */
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-32 h-32 bg-secondary rounded-full flex items-center justify-center">
                                                <span className="text-3xl text-white">
                                                    {userType === "medico" ? "MG" : "DR"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded">
                                            {userType === "medico"
                                                ? "María González"
                                                : "Dr. Carlos Ramírez"}
                                        </div>

                                        {/* Mini vista propia */}
                                        <div className="absolute bottom-4 right-4 w-48 aspect-video bg-gray-800 rounded border-2 border-white">
                                            <div className="w-full h-full flex items-center justify-center">
                                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                                                    <span className="text-sm text-white">TÚ</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Controles */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                onClick={() => setVideoEnabled(!videoEnabled)}
                                                className={
                                                    !videoEnabled
                                                        ? "bg-destructive text-white hover:bg-destructive/90"
                                                        : "bg-white/90 hover:bg-white"
                                                }
                                            >
                                                {videoEnabled ? (
                                                    <Video className="h-5 w-5" />
                                                ) : (
                                                    <VideoOff className="h-5 w-5" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                onClick={() => setAudioEnabled(!audioEnabled)}
                                                className={
                                                    !audioEnabled
                                                        ? "bg-destructive text-white hover:bg-destructive/90"
                                                        : "bg-white/90 hover:bg-white"
                                                }
                                            >
                                                {audioEnabled ? (
                                                    <Mic className="h-5 w-5" />
                                                ) : (
                                                    <MicOff className="h-5 w-5" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                className="bg-white/90 hover:bg-white"
                                            >
                                                <Monitor className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                onClick={handleEndCall}
                                                size="lg"
                                                className="bg-destructive hover:bg-destructive/90"
                                            >
                                                <PhoneOff className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Card className="p-4 h-full">
                                        <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                                            <MessageSquare className="h-5 w-5 text-primary" />
                                            <h4 className="text-sm">Chat de la Consulta</h4>
                                        </div>
                                        <div className="text-sm text-center text-muted-foreground">
                                            No hay mensajes aún
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
