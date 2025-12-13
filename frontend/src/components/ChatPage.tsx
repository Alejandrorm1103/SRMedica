import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import {
    Send,
    Paperclip,
    ArrowLeft,
    FileText,
    Image as ImageIcon,
    Download,
} from "lucide-react";

interface ChatPageProps {
    userType: "medico" | "paciente";
    onNavigate: (page: string) => void;
}

interface Message {
    id: number;
    sender: "me" | "other";
    text: string;
    time: string;
    file?: {
        name: string;
        type: string;
    };
}

export function ChatPage({ userType, onNavigate }: ChatPageProps) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            sender: "other",
            text: "Hola, ¿cómo te encuentras hoy?",
            time: "10:30 AM",
        },
        {
            id: 2,
            sender: "me",
            text: "Buenos días, me siento mejor. Gracias por preguntar.",
            time: "10:32 AM",
        },
        {
            id: 3,
            sender: "other",
            text: "Me alegro. Te he enviado los resultados de los análisis.",
            time: "10:33 AM",
            file: {
                name: "Resultados_Analisis.pdf",
                type: "pdf",
            },
        },
    ]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        const newMessage: Message = {
            id: messages.length + 1,
            sender: "me",
            text: message,
            time: new Date().toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        setMessages([...messages, newMessage]);
        setMessage("");
    };

    const otherPersonName =
        userType === "medico" ? "María González" : "Dr. Carlos Ramírez";

    return (
        <div className="flex-1 flex flex-col">
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
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-sm text-white">
                                    {otherPersonName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-primary">{otherPersonName}</h2>
                                <p className="text-xs text-muted-foreground">En línea</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 container mx-auto px-4 py-4">
                <div className="max-w-4xl mx-auto h-full flex flex-col">
                    <Card className="flex-1 flex flex-col">
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"
                                            }`}
                                    >
                                        <div
                                            className={`max-w-[70%] ${msg.sender === "me"
                                                ? "bg-primary text-white"
                                                : "bg-gray-100"
                                                } rounded-lg p-3`}
                                        >
                                            <p className="text-sm">{msg.text}</p>
                                            {msg.file && (
                                                <div className="mt-2 p-3 bg-white/10 rounded flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        {msg.file.type === "pdf" ? (
                                                            <FileText className="h-5 w-5" />
                                                        ) : (
                                                            <ImageIcon className="h-5 w-5" />
                                                        )}
                                                        <span className="text-xs">{msg.file.name}</span>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className={
                                                            msg.sender === "me"
                                                                ? "text-white hover:bg-white/20"
                                                                : "hover:bg-black/10"
                                                        }
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                            <p
                                                className={`text-xs mt-1 ${msg.sender === "me"
                                                    ? "text-white/70"
                                                    : "text-gray-500"
                                                    }`}
                                            >
                                                {msg.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="flex-shrink-0"
                                >
                                    <Paperclip className="h-5 w-5" />
                                </Button>
                                <Input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Escribe un mensaje..."
                                    className="flex-1 bg-white"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="bg-primary hover:bg-secondary flex-shrink-0"
                                >
                                    <Send className="h-5 w-5" />
                                </Button>
                            </form>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
