import React from 'react';

// =================================================================
// 1. DEFINICIÓN DE DATOS (Interna al componente)
// =================================================================
const navLinks = [
  { href: '#srv-medico', text: 'Servicios médicos' },
  { href: '#srv-nutricion', text: 'Nutrición' },
  { href: '#srv-deporte', text: 'Deporte y rendimiento' },
  { href: '#srv-mental', text: 'Salud mental' },
  { href: '#srv-autoinmunes', text: 'Patologías autoinmunes' },
  { href: '#srv-teleconsulta', text: 'Teleconsulta y remisión' },
];

const serviciosData = [
  {
    titulo: 'Medicina general y seguimiento',
    para: 'Pacientes adultos',
    descripcion: 'Valoración inicial, controles periódicos y seguimiento de condiciones crónicas como hipertensión, diabetes u obesidad.',
    modalidad: 'Teleconsulta y presencial (según red aliada)',
    id: 'srv-medico',
  },
  {
    titulo: 'Pediatría integral',
    para: 'Niños, niñas y adolescentes',
    descripcion: 'Controles de crecimiento y desarrollo, vacunación, orientación a familias y manejo de patologías frecuentes en edad pediátrica.',
    modalidad: '100% en línea + remisión a hospitales aliados',
    id: 'srv-pediatria',
  },
  {
    titulo: 'Asesoramiento nutricional',
    para: 'Pacientes en general',
    descripcion: 'Planes de alimentación personalizados para control de peso, mejora de energía y prevención de enfermedades metabólicas.',
    modalidad: 'Agenda online con nutricionistas',
    id: 'srv-nutricion',
  },
  {
    titulo: 'Nutriología clínica avanzada',
    para: 'Pacientes con patologías complejas',
    descripcion: 'Soporte nutricional en enfermedades autoinmunes, oncológicas, postquirúrgicas y otras condiciones que requieren monitoreo especializado.',
    modalidad: 'Teleconsulta especializada',
    id: 'srv-nutriologia',
  },
  {
    titulo: 'Asesoramiento deportivo de alta calidad',
    para: 'Deportistas aficionados y profesionales',
    descripcion: 'Diseño de rutinas, control de cargas, prevención de lesiones y coordinación con el plan nutricional para optimizar el rendimiento.',
    modalidad: 'Sesiones virtuales con profesionales del deporte',
    id: 'srv-deporte',
  },
  {
    titulo: 'Psicología y bienestar emocional',
    para: 'Pacientes de todas las edades',
    descripcion: 'Acompañamiento en ansiedad, estrés, duelo, depresión leve y orientación familiar, con enfoque humano y confidencial.',
    modalidad: '100% en línea',
    id: 'srv-mental',
  },
  {
    titulo: 'Seguimiento de patologías autoinmunes',
    para: 'Pacientes con diagnósticos autoinmunes',
    descripcion: 'Coordinación entre medicina general, especialistas y nutrición para hacer seguimiento a enfermedades autoinmunes y sus tratamientos.',
    modalidad: 'Teleconsulta + monitoreo periódico',
    id: 'srv-autoinmunes',
  },
  {
    titulo: 'Teleconsulta inicial y remisión a hospitales',
    para: 'Pacientes con signos de alarma',
    descripcion: 'Evaluación médica en línea para determinar la urgencia y, cuando es necesario, remisión segura a hospitales y clínicas aliadas.',
    modalidad: 'Disponible 7 días a la semana',
    id: 'srv-teleconsulta',
  },
];

const testimonios = [
  {
    nombre: 'Laura G.',
    tag: 'Paciente con enfermedad autoinmune',
    texto: '“Antes tenía que desplazarme varias horas para ver a mis especialistas. Ahora hago el seguimiento por SRMedica, coordinan con nutrición y psicología y solo voy al hospital cuando realmente es necesario.”',
  },
  {
    nombre: 'Carlos A.',
    tag: 'Trabajador remoto',
    texto: '“La plataforma me permite agendar citas en los horarios que tengo libres. Hice mi valoración nutricional y deportiva sin perder días de trabajo. La teleconsulta es clara y el resumen queda guardado en mi historia clínica.”',
  },
  {
    nombre: 'Marta y Julián',
    tag: 'Familia con niños pequeños',
    texto: '“Como padres, nos sentimos tranquilos porque tenemos pediatría y psicología en el mismo entorno digital. Es más inclusivo, no necesitamos transporte especial y podemos conectarnos desde casa.”',
  },
];

// =================================================================
// 2. COMPONENTE PRINCIPAL
// =================================================================

function ServiciosSRMedica() {

  // Encabezados de la tabla
  const gridHeaders = ['Servicio', '¿Para quién?', 'Descripción', 'Modalidad'];

  // Función para renderizar el Grid de Servicios
  const renderServicioGrid = () => (
    <div className="relative z-10">
      {/* Encabezados del Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-2 mb-2 text-sm">
        {gridHeaders.map((header, index) => (
          <div
            key={index}
            // Clases de Hero UI / Tailwind CSS para el gradiente y las esquinas redondeadas
            className="font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl md:rounded-2xl shadow-md"
          >
            {header}
          </div>
        ))}
      </div>

      {/* Filas de Servicios */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
        {serviciosData.map((servicio, rowIndex) => (
          <React.Fragment key={servicio.id}>
            {/* Clases de Tailwind para alternar color de fondo */}

            {/* Servicio - Columna 1 */}
            <div
              id={servicio.id}
              className={`p-3 rounded-lg ${rowIndex % 2 === 0 ? 'bg-blue-50' : 'bg-gray-50'} font-semibold text-blue-900`}
            >
              {servicio.titulo}
            </div>
            {/* ¿Para quién? - Columna 2 */}
            <div className={`p-3 rounded-lg ${rowIndex % 2 === 0 ? 'bg-blue-50' : 'bg-gray-50'} text-gray-700`}>
              {servicio.para}
            </div>
            {/* Descripción - Columna 3 */}
            <div className={`p-3 rounded-lg ${rowIndex % 2 === 0 ? 'bg-blue-50' : 'bg-gray-50'} text-gray-700`}>
              {servicio.descripcion}
            </div>
            {/* Modalidad - Columna 4 */}
            <div className={`p-3 rounded-lg ${rowIndex % 2 === 0 ? 'bg-blue-50' : 'bg-gray-50'} text-gray-700`}>
              {servicio.modalidad}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  // Función para renderizar el CTA de WhatsApp
  const renderWhatsappCTA = () => (
    <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10 pt-4 border-t border-gray-100">
      <p className="text-sm text-gray-600 max-w-xl">
        <strong className="text-blue-900">¿Tienes dudas sobre cuál servicio es el ideal para ti o tu familia?</strong><br />
        Nuestro equipo puede orientarte y ayudarte a elegir la mejor ruta de atención,
        tanto para controles rutinarios como para situaciones complejas.
      </p>
      <div className="flex flex-wrap gap-3 mt-5">
        {/* Botón 1: Solicitar consulta (Estilo Primario Azul) */}
        <a
          href="#srv-teleconsulta"
          className="
            px-6 py-2 
            rounded-full 
            font-semibold 
            text-sm md:text-base 
            bg-lightblue hover:bg-blue
            text-white 
            transition duration-200 
            shadow-lg shadow-blue-400/50 
            flex items-center gap-2 
        "
        >
          Solicitar consulta
        </a>

        {/* Botón 2: Contactar por WhatsApp (Estilo Secundario/WhatsApp Verde) */}
        <a
          // Mantenemos la estructura de Hero UI/Tailwind que ya era buena
          className="
            px-6 py-2 
            rounded-full 
            font-semibold 
            text-sm md:text-base 
            bg-green-500 hover:bg-green-600 
            text-white
            transition duration-200 
            shadow-lg shadow-green-400/50 
            flex items-center gap-2
        "
          href="https://wa.me/34123456789?text=Hola%20SRMedica,%20quisiera%20más%20información%20sobre%20los%20servicios."
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="text-lg">📞</span> +34654722876 Contactar por WhatsApp
        </a>
      </div>
    </div>
  );

  // Función para renderizar la sección de Testimonios
  const renderTestimoniosSection = () => (
    <section className="py-10 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-center text-3xl font-extrabold text-blue-900 mb-2">
          Opiniones de nuestros pacientes
        </h2>
        <p className="text-center max-w-2xl mx-auto text-base text-gray-600 mb-10">
          SRMedica facilita el acceso a la salud para personas que trabajan, cuidan de otros
          o viven lejos de los grandes centros urbanos. Estas son algunas experiencias reales.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonios.map((testimonio, index) => (
            <article key={index}
              // Tarjeta de Testimonio con clases de Hero UI / Tailwind
              className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 hover:shadow-2xl transition duration-300">
              <div className="text-yellow-500 mb-1 text-xl">★★★★★</div>
              <div className="font-semibold text-lg text-gray-900">{testimonio.nombre}</div>
              <div className="text-xs text-gray-500 mb-4">{testimonio.tag}</div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {testimonio.texto}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );


  return (
    <>
      {/* ================= SERVICIOS SRMEDICA (Tailwind CSS) ================= */}
      <section id="servicios-srmedica"
        // Estilos de fondo y padding de Tailwind
        className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-3xl md:text-4xl font-extrabold text-blue-900 mb-2">
            Servicios de SRMedica
          </h2>
          <p className="text-center max-w-3xl mx-auto text-base text-gray-600 mb-8">
            Conectamos pacientes con equipos médicos interdisciplinarios para ofrecer atención
            integral en medicina general, especialidades, nutrición, deporte y salud mental,
            con enfoque inclusivo y accesible para todos.
          </p>

          {/* Menú de navegación por tipo de servicio (Anclas) */}
          <nav className="flex flex-wrap justify-center gap-2 mb-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                // Estilos de Hero UI / Tailwind para un botón interactivo y redondeado
                className="text-sm font-medium px-4 py-2 rounded-full border border-blue-500 text-blue-500 bg-white shadow-lg transition duration-200 hover:bg-blue-500 hover:text-white hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {link.text}
              </a>
            ))}
          </nav>

          {/* Banda / tabla de servicios (Card de 'Glass' simulado) */}
          <div
            // Estilos de Hero UI / Tailwind para un contenedor moderno (blur/sombra)
            className="relative p-7 md:p-9 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-blue-200/50 overflow-hidden">

            {renderServicioGrid()}

            {renderWhatsappCTA()}
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIOS ================= */}
      {renderTestimoniosSection()}
    </>
  );
}

export default ServiciosSRMedica;