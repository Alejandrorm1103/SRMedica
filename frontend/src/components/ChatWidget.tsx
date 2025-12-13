import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { MessageCircle, X, Send, Paperclip } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { useAuth } from "../context/AuthContext";

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
        { text: "¡Hola! ¿En qué podemos ayudarte hoy?", isUser: false },
    ]);
    const [inputValue, setInputValue] = useState("");
    const { user } = useAuth();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    if (!user) return null; // Solo mostrar si hay usuario logueado

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        setMessages((prev) => [...prev, { text: inputValue, isUser: true }]);
        const userText = inputValue;
        setInputValue("");

        // Respuesta automática simulada
        setTimeout(() => {
            let response = "Gracias por tu mensaje. Un agente te responderá pronto.";
            if (userText.toLowerCase().includes("cita")) {
                response = "Para agendar citas, puedes ir a la sección 'Agendar Cita' en tu panel principal.";
            } else if (userText.toLowerCase().includes("hola")) {
                response = "¡Hola! Espero que estés teniento un buen día.";
            }
            setMessages((prev) => [...prev, { text: response, isUser: false }]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">

            {/* Ventana de Chat */}
            {isOpen && (
                <Card className="w-[350px] h-[450px] flex flex-col shadow-2xl border-slate-200 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="p-4 bg-primary text-white rounded-t-lg flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="font-semibold">Soporte SRMedica</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-white hover:bg-white/20 rounded-full"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Área de Mensajes */}
                    <ScrollArea className="flex-1 p-4 bg-slate-50" ref={scrollRef}>
                        <div className="space-y-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`
                      max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-sm
                      ${msg.isUser
                                                ? 'bg-primary text-white rounded-tr-none'
                                                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                                            }
                    `}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-3 border-t bg-white rounded-b-lg">
                        <form
                            className="flex gap-2"
                            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                        >
                            <Input
                                placeholder="Escribe un mensaje..."
                                className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-primary/20"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90 h-10 w-10 shrink-0">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </Card>
            )}

            {/* Botón Flotante (Toggle) */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-105
          ${isOpen ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-primary text-white hover:bg-primary/90'}
        `}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
            </Button>
        </div>
    );
}
