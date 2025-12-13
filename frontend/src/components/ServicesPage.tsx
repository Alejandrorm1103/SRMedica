
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function ServicesPage() {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-[#f4fbff] font-sans relative z-0">
            {/* ================= SERVICIOS SRMEDICA ================= */}
            <section className="py-20 px-4 bg-gradient-to-b from-[#e5f4ff] via-[#f4fbff] to-white">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-[#024b85] text-center mb-4">
                        Servicios de SRMedica
                    </h2>
                    <p className="max-w-3xl mx-auto text-center text-[#4f6377] mb-8 text-base">
                        Conectamos pacientes con equipos médicos interdisciplinarios para ofrecer atención
                        integral en medicina general, especialidades, nutrición, deporte y salud mental,
                        con enfoque inclusivo y accesible para todos.
                    </p>

                    {/* Menú de navegación por tipo de servicio */}
                    <nav className="flex flex-wrap justify-center gap-3 mb-8">
                        {[
                            { id: 'srv-medico', label: 'Servicios médicos' },
                            { id: 'srv-nutricion', label: 'Nutrición' },
                            { id: 'srv-deporte', label: 'Deporte y rendimiento' },
                            { id: 'srv-mental', label: 'Salud mental' },
                            { id: 'srv-autoinmunes', label: 'Patologías autoinmunes' },
                            { id: 'srv-teleconsulta', label: 'Teleconsulta y remisión' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className="px-5 py-2 rounded-full border border-[#0a8de7] text-[#0a8de7] bg-white font-medium text-sm shadow-sm hover:bg-[#0a8de7] hover:text-white hover:-translate-y-px hover:shadow-md transition-all duration-200"
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    {/* Banda / tabla de servicios */}
                    <div className="relative rounded-[26px] p-7 bg-white/90 backdrop-blur-md shadow-[0_25px_55px_rgba(0,0,0,0.07)] overflow-hidden">
                        {/* Círculos decorativos */}
                        <div className="absolute w-[180px] h-[180px] rounded-full bg-[radial-gradient(circle,rgba(0,180,255,0.15),transparent_70%)] -top-[60px] -right-[60px] pointer-events-none"></div>
                        <div className="absolute w-[220px] h-[220px] rounded-full bg-[radial-gradient(circle,rgba(0,180,255,0.15),transparent_70%)] -bottom-[80px] -left-[80px] pointer-events-none"></div>

                        {/* Grid */}
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1.3fr_1fr_1.6fr_1fr] gap-x-4 gap-y-3 text-sm">
                            {/* Headers - Hidden on mobile if desired, but keeping simple for now */}
                            <div className="hidden md:block font-semibold text-white bg-gradient-to-r from-[#008bf4] to-[#00c2ff] px-4 py-3 rounded-l-2xl">Servicio</div>
                            <div className="hidden md:block font-semibold text-white bg-gradient-to-r from-[#008bf4] to-[#00c2ff] px-4 py-3">¿Para quién?</div>
                            <div className="hidden md:block font-semibold text-white bg-gradient-to-r from-[#008bf4] to-[#00c2ff] px-4 py-3">Descripción</div>
                            <div className="hidden md:block font-semibold text-white bg-gradient-to-r from-[#008bf4] to-[#00c2ff] px-4 py-3 rounded-r-2xl">Modalidad</div>

                            {/* Items */}
                            {/* 1. Medico */}
                            <div id="srv-medico" className="p-3 bg-[#f7fbff] rounded-xl font-semibold text-[#024b85] md:col-start-1">Medicina general y seguimiento</div>
                            <div className="p-3 bg-[#f7fbff] rounded-xl md:col-start-2"><span className="md:hidden font-bold">¿Para quién?: </span>Pacientes adultos</div>
                            <div className="p-3 bg-[#f7fbff] rounded-xl md:col-start-3"><span className="md:hidden font-bold">Descripción: </span>Valoración inicial, controles periódicos y seguimiento de condiciones crónicas como hipertensión, diabetes u obesidad.</div>
                            <div className="p-3 bg-[#f7fbff] rounded-xl md:col-start-4"><span className="md:hidden font-bold">Modalidad: </span>Teleconsulta y presencial (según red aliada)</div>

                            {/* 2. Pediatria */}
                            <div className="p-3 bg-[#edf5ff] rounded-xl font-semibold text-[#024b85] md:col-start-1">Pediatría integral</div>
                            <div className="p-3 bg-[#edf5ff] rounded-xl md:col-start-2"><span className="md:hidden font-bold">¿Para quién?: </span>Niños, niñas y adolescentes</div>
                            <div className="p-3 bg-[#edf5ff] rounded-xl md:col-start-3"><span className="md:hidden font-bold">Descripción: </span>Controles de crecimiento y desarrollo, vacunación, orientación a familias y manejo de patologías frecuentes en edad pediátrica.</div>
                            <div className="p-3 bg-[#edf5ff] rounded-xl md:col-start-4"><span className="md:hidden font-bold">Modalidad: </span>100% en línea + remisión a hospitales aliados</div>

                            {/* 3. Nutricion */}
                            <div id="srv-nutricion" className="p-3 bg-[#f7fbff] rounded-xl font-semibold text-[#024b85] md:col-start-1">Asesoramiento nutricional</div>
                            <div className="p-3 bg-[#f7fbff] rounded-xl md:col-start-2"><span className="md:hidden font-bold">¿Para quién?: </span>Pacientes en general</div>
                            <div className="p-3 bg-[#f7fbff] rounded-xl md:col-start-3"><span className="md:hidden font-bold">Descripción: </span>Planes de alimentación personalizados para control de peso, mejora de energía y prevención de enfermedades metabólicas.</div>
                            <div className="p-3 bg-[#f7fbff] rounded-xl md:col-start-4"><span className="md:hidden font-bold">Modalidad: </span>Agenda online con nutricionistas</div>

                            {/* 4. Nutriologia Avanzada */}
                            <div className="p-3 bg-[#edf5ff] rounded-xl font-semibold text-[#024b85] md:col-start-1">Nutriología clínica avanzada</div>
                            <div className="p-3 bg-[#edf5ff] rounded-xl md:col-start-2"><span className="md:hidden font-bold">¿Para quién?: </span>Pacientes con patologías complejas</div>
                            <div className="p-3 bg-[#edf5ff] rounded-xl md:col-start-3"><span className="md:hidden font-bold">Descripción: </span>Soporte nutricional en enfermedades autoinmunes, oncológicas, postquirúrgicas y otras condiciones que requieren monitoreo especializado.</div>
                            <div className="p-3 bg-[#edf5ff] rounded-xl md:col-start-4"><span className="md:hidden font-bold">Modalidad: </span>Teleconsulta especializada</div>

                            {/* 5. Deporte */}
                            <div id="srv-deporte" className="p-3 bg-[#f7fbff] rounded-xl font-semibold text-[#024b85] md:col-start-1">Asesoramiento deportivo de alta calidad</div>
                            <div className="p-3 bg-[#f7fbff] rounded-xl md:col-start-2"><span className="md:hidden font-bold">¿Para quién?: </span>Deportistas aficionados y profesionales</div>
                            <div className="p-3 bg-[#f7fbff] rounded-xl md:col-start-3"><span className="md:hidden font-bold">Descripción: </span>Diseño de rutinas, control de cargas, prevención de lesiones y coordinación con el plan nutricional para optimizar el rendimiento.</div>
                            <div className="p-3 bg-[#f7fbff] rounded-xl md:col-start-4"><span className="md:hidden font-bold">Modalidad: </span>Sesiones virtuales con profesionales del deporte</div>

                            {/* 6. Mental */}
                            <div id="srv-mental" className="p-3 bg-[#edf5ff] rounded-xl font-semibold text-[#024b85] md:col-start-1">Psicología y bienestar emocional</div>
                            <div className="p-3 bg-[#edf5ff] rounded-xl md:col-start-2"><span className="md:hidden font-bold">¿Para quién?: </span>Pacientes de todas las edades</div>
                            <div className="p-3 bg-[#edf5ff] rounded-xl md:col-start-3"><span className="md:hidden font-bold">Descripción: </span>Acompañamiento en ansiedad, estrés, duelo, depresión leve y orientación familiar, con enfoque humano y confidencial.</div>
                            <div className="p-3 bg-[#edf5ff] rounded-xl md:col-start-4"><span className="md:hidden font-bold">Modalidad: </span>100% en línea</div>

                            {/* 7. Autoinmunes */}
                            <div id="srv-autoinmunes" className="p-3 bg-[#f7fbff] rounded-xl font-semibold text-[#024b85] md:col-start-1">Seguimiento de patologías autoinmunes</div>
                            <div className="p-3 bg-[#f7fbff] rounded-xl md:col-start-2"><span className="md:hidden font-bold">¿Para quién?: </span>Pacientes con diagnósticos autoinmunes</div>
                            <div className="p-3 bg-[#f7fbff] rounded-xl md:col-start-3"><span className="md:hidden font-bold">Descripción: </span>Coordinación entre medicina general, especialistas y nutrición para hacer seguimiento a enfermedades autoinmunes y sus tratamientos.</div>
                            <div className="p-3 bg-[#f7fbff] rounded-xl md:col-start-4"><span className="md:hidden font-bold">Modalidad: </span>Teleconsulta + monitoreo periódico</div>

                            {/* 8. Teleconsulta */}
                            <div id="srv-teleconsulta" className="p-3 bg-[#edf5ff] rounded-xl font-semibold text-[#024b85] md:col-start-1">Teleconsulta inicial y remisión a hospitales</div>
                            <div className="p-3 bg-[#edf5ff] rounded-xl md:col-start-2"><span className="md:hidden font-bold">¿Para quién?: </span>Pacientes con signos de alarma</div>
                            <div className="p-3 bg-[#edf5ff] rounded-xl md:col-start-3"><span className="md:hidden font-bold">Descripción: </span>Evaluación médica en línea para determinar la urgencia y, cuando es necesario, remisión segura a hospitales y clínicas aliadas.</div>
                            <div className="p-3 bg-[#edf5ff] rounded-xl md:col-start-4"><span className="md:hidden font-bold">Modalidad: </span>Disponible 7 días a la semana</div>
                        </div>

                        {/* CTA WhatsApp */}
                        <div className="mt-8 flex flex-wrap justify-between items-center gap-4 relative z-10">
                            <p className="text-[#42576b] text-sm max-w-lg">
                                <strong className="text-[#024b85]">¿Tienes dudas sobre cuál servicio es el ideal para ti o tu familia?</strong><br />
                                Nuestro equipo puede orientarte y ayudarte a elegir la mejor ruta de atención,
                                tanto para controles rutinarios como para situaciones complejas.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <button onClick={() => scrollToSection('srv-teleconsulta')} className="px-6 py-2.5 rounded-full border-2 border-white bg-[#0a70c4] text-white font-semibold text-sm shadow-md hover:bg-[#09579b] hover:-translate-y-px transition-all">
                                    Solicitar consulta
                                </button>
                                <a
                                    href="https://wa.me/34654722876?text=Hola%20SRMedica,%20quisiera%20más%20información%20sobre%20los%20servicios."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-2.5 rounded-full bg-[#25d366] text-white font-semibold text-sm flex items-center gap-2 shadow-md hover:bg-[#1ebe5a] hover:-translate-y-px transition-all"
                                >
                                    <span className="text-lg">📱</span> Contactar por WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= TESTIMONIOS ================= */}
            <section className="py-10 pb-20 bg-white">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-[#024b85] text-center mb-2">Opiniones de nuestros pacientes</h2>
                    <p className="max-w-2xl mx-auto text-center text-[#4f6377] mb-8 text-sm">
                        SRMedica facilita el acceso a la salud para personas que trabajan, cuidan de otros
                        o viven lejos de los grandes centros urbanos. Estas son algunas experiencias reales.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <article className="bg-[#f7fbff] rounded-2xl p-5 shadow-sm">
                            <div className="text-yellow-400 mb-1.5">★★★★★</div>
                            <div className="font-semibold text-[#112334] mb-1">Laura G.</div>
                            <div className="text-xs text-[#6d8194] mb-3">Paciente con enfermedad autoinmune</div>
                            <p className="text-[#42576b] text-sm leading-relaxed">
                                “Antes tenía que desplazarme varias horas para ver a mis especialistas.
                                Ahora hago el seguimiento por SRMedica, coordinan con nutrición y psicología
                                y solo voy al hospital cuando realmente es necesario.”
                            </p>
                        </article>

                        <article className="bg-[#f7fbff] rounded-2xl p-5 shadow-sm">
                            <div className="text-yellow-400 mb-1.5">★★★★★</div>
                            <div className="font-semibold text-[#112334] mb-1">Carlos A.</div>
                            <div className="text-xs text-[#6d8194] mb-3">Trabajador remoto</div>
                            <p className="text-[#42576b] text-sm leading-relaxed">
                                “La plataforma me permite agendar citas en los horarios que tengo libres.
                                Hice mi valoración nutricional y deportiva sin perder días de trabajo.
                                La teleconsulta es clara y el resumen queda guardado en mi historia clínica.”
                            </p>
                        </article>

                        <article className="bg-[#f7fbff] rounded-2xl p-5 shadow-sm">
                            <div className="text-yellow-400 mb-1.5">★★★★★</div>
                            <div className="font-semibold text-[#112334] mb-1">Marta y Julián</div>
                            <div className="text-xs text-[#6d8194] mb-3">Familia con niños pequeños</div>
                            <p className="text-[#42576b] text-sm leading-relaxed">
                                “Como padres, nos sentimos tranquilos porque tenemos pediatría y psicología
                                en el mismo entorno digital. Es más inclusivo, no necesitamos transporte
                                especial y podemos conectarnos desde casa.”
                            </p>
                        </article>
                    </div>
                </div>
            </section>
        </div>
    );
}
