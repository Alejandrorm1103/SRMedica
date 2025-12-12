
import { useState, useEffect } from "react";
import {
    Heart,
    Users,
    Award,
    Target,
    Eye,
    Shield,
    Mail,
    Phone,
    MapPin,
    CheckCircle2,
} from "lucide-react";

export function InfoPage() {
    const [formData, setFormData] = useState({
        nombre: "",
        email: "",
        telefono: "",
        asunto: "",
        mensaje: "",
    });
    const [submitted, setSubmitted] = useState(false);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
        setFormData({
            nombre: "",
            email: "",
            telefono: "",
            asunto: "",
            mensaje: "",
        });
    };

    return (
        <div className="min-h-screen bg-[#f4fbff] font-sans relative z-0">
            {/* ================= HERO SECTION ================= */}
            <section className="py-24 px-4 bg-gradient-to-b from-[#e5f4ff] via-[#f4fbff] to-white relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(0,180,255,0.08),transparent_70%)] -top-[50px] -right-[50px] pointer-events-none"></div>
                <div className="absolute w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(0,180,255,0.08),transparent_70%)] top-[100px] -left-[100px] pointer-events-none"></div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#024b85] mb-6 tracking-tight">
                        Conoce más sobre SRMedica
                    </h1>
                    <p className="text-lg md:text-xl text-[#4f6377] max-w-2xl mx-auto leading-relaxed">
                        Transformamos la atención médica conectando tecnología y humanidad.
                        Tu salud y bienestar son nuestra prioridad absoluta.
                    </p>
                </div>
            </section>

            {/* ================= QUIÉNES SOMOS (Misión / Visión) ================= */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Misión */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-white/50 hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-14 h-14 bg-blue/10 rounded-2xl flex items-center justify-center mb-6 text-[#0a8de7]">
                                <Target className="h-7 w-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-[#024b85] mb-4">Nuestra Misión</h3>
                            <p className="text-[#4f6377] leading-relaxed">
                                Facilitar el acceso a servicios de salud de calidad mediante tecnología moderna,
                                conectando pacientes y médicos de forma eficiente, segura y centrada en el
                                bienestar del paciente.
                            </p>
                        </div>

                        {/* Visión */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-white/50 hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-14 h-14 bg-blue/10 rounded-2xl flex items-center justify-center mb-6 text-[#0a8de7]">
                                <Eye className="h-7 w-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-[#024b85] mb-4">Nuestra Visión</h3>
                            <p className="text-[#4f6377] leading-relaxed">
                                Ser la plataforma líder en telemedicina y gestión de salud digital,
                                reconocida por nuestra innovación, confiabilidad y compromiso con la
                                transformación del sector salud en toda la región.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= NUESTROS VALORES ================= */}
            <section className="py-20 px-4 bg-white relative">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[#024b85] mb-4">Nuestros Valores</h2>
                        <p className="text-[#4f6377] max-w-2xl mx-auto">
                            Los pilares fundamentales que guían cada decisión y servicio que ofrecemos.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Heart, title: "Compromiso", desc: "Dedicados al bienestar y salud integral de cada paciente." },
                            { icon: Shield, title: "Seguridad", desc: "Protección de datos y confidencialidad garantizada al 100%." },
                            { icon: Users, title: "Accesibilidad", desc: "Salud al alcance de todos, sin barreras geográficas." },
                            { icon: Award, title: "Excelencia", desc: "Calidad médica y profesionalismo en cada interacción." },
                        ].map((item, idx) => (
                            <div key={idx} className="group p-6 rounded-2xl bg-[#f7fbff] hover:bg-[#e5f4ff] transition-colors duration-300 text-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                    <item.icon className="h-7 w-7 text-[#0a8de7]" />
                                </div>
                                <h4 className="text-lg font-bold text-[#112334] mb-2">{item.title}</h4>
                                <p className="text-sm text-[#6d8194] leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= POR QUÉ ELEGIRNOS ================= */}
            <section className="py-20 px-4 bg-[#f4fbff]">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-gradient-to-br from-[#0a8de7] to-[#024b85] rounded-[30px] p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
                        {/* Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-16 -mb-16"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold text-center mb-12 text-white">¿Por Qué Elegir SRMedica?</h2>

                            <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                                {[
                                    { title: "Consultas Virtuales", desc: "Videollamadas HD con especialistas desde tu hogar." },
                                    { title: "Agendamiento Fácil", desc: "Gestiona tus citas en minutos desde cualquier dispositivo." },
                                    { title: "Historial Digital", desc: "Toda tu información médica organizada y siempre disponible." },
                                    { title: "Comunicación Directa", desc: "Chat seguro con doctores y envío de documentos." },
                                    { title: "Especialistas", desc: "Red de profesionales verificados y altamente cualificados." },
                                    { title: "Soporte 24/7", desc: "Plataforma disponible en todo momento para ti." },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                                            <CheckCircle2 className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg mb-1">{item.title}</h4>
                                            <p className="text-blue-100 text-sm leading-relaxed opacity-90">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= CONTACTO ================= */}
            <section className="py-20 px-4 relative">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#024b85] mb-4">Contáctanos</h2>
                        <p className="text-[#4f6377]">¿Tienes alguna pregunta? Estamos aquí para ayudarte.</p>
                    </div>

                    <div className="grid md:grid-cols-12 gap-8 items-start">
                        {/* Info Cards - Columna Izquierda (4 cols) */}
                        <div className="md:col-span-5 space-y-6">
                            {[
                                { icon: Phone, title: "Teléfono", l1: "+57 123 456 7890", l2: "Lun - Vie: 8:00 - 18:00" },
                                { icon: Mail, title: "Email", l1: "info@srmedica.com", l2: "soporte@srmedica.com" },
                                { icon: MapPin, title: "Ubicación", l1: "Calle Principal 123", l2: "Bogotá, Colombia" },
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-5">
                                    <div className="w-12 h-12 bg-[#e5f4ff] rounded-full flex items-center justify-center flex-shrink-0 text-[#0a8de7]">
                                        <item.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#112334] mb-1">{item.title}</h4>
                                        <p className="text-sm text-[#4f6377]">{item.l1}</p>
                                        <p className="text-sm text-[#4f6377]">{item.l2}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Formulario - Columna Derecha (8 cols) */}
                        <div className="md:col-span-7">
                            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                                <h3 className="text-2xl font-bold text-[#024b85] mb-6">Envíanos un mensaje</h3>

                                {submitted ? (
                                    <div className="p-6 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 animate-fade-in">
                                        <CheckCircle2 className="h-6 w-6" />
                                        <span className="font-medium">!Mensaje enviado exitosamente! Te responderemos pronto.</span>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label htmlFor="nombre" className="text-sm font-semibold text-[#42576b]">Nombre Completo</label>
                                                <input
                                                    id="nombre"
                                                    type="text"
                                                    required
                                                    value={formData.nombre}
                                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0a8de7] focus:ring-2 focus:ring-[#0a8de7]/20 outline-none transition-all placeholder-gray-400"
                                                    placeholder="Tu nombre"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="email" className="text-sm font-semibold text-[#42576b]">Email</label>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0a8de7] focus:ring-2 focus:ring-[#0a8de7]/20 outline-none transition-all placeholder-gray-400"
                                                    placeholder="tucorreo@ejemplo.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label htmlFor="telefono" className="text-sm font-semibold text-[#42576b]">Teléfono</label>
                                                <input
                                                    id="telefono"
                                                    type="tel"
                                                    value={formData.telefono}
                                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0a8de7] focus:ring-2 focus:ring-[#0a8de7]/20 outline-none transition-all placeholder-gray-400"
                                                    placeholder="+57..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="asunto" className="text-sm font-semibold text-[#42576b]">Asunto</label>
                                                <input
                                                    id="asunto"
                                                    type="text"
                                                    required
                                                    value={formData.asunto}
                                                    onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0a8de7] focus:ring-2 focus:ring-[#0a8de7]/20 outline-none transition-all placeholder-gray-400"
                                                    placeholder="Motivo de contacto"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="mensaje" className="text-sm font-semibold text-[#42576b]">Mensaje</label>
                                            <textarea
                                                id="mensaje"
                                                required
                                                rows={4}
                                                value={formData.mensaje}
                                                onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0a8de7] focus:ring-2 focus:ring-[#0a8de7]/20 outline-none transition-all placeholder-gray-400 resize-none"
                                                placeholder="¿En qué podemos ayudarte?"
                                            ></textarea>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-[#0a8de7] hover:bg-[#024b85] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                        >
                                            Enviar Mensaje
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
