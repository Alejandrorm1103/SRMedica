interface BannerProps {
    onNavigate: (page: string) => void;
}

const Banner = ({ onNavigate }: BannerProps) => {
    return (
        <main>
            <div className="px-6 lg:px-8">
                <div className="mx-auto max-w-7xl pt-16 sm:pt-20 pb-20 banner-image">
                    <div className="text-center">
                        <h1 className="text-3xl font-semibold text-navyblue sm:text-4xl lg:text-6xl md:3px lh-95">
                            Tu salud, a un clic de distancia.<br />Consulta con médicos certificados desde la comodidad de tu hogar.
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-bluegray">
                            Medicina en línea: la forma más fácil, rápida y segura de cuidar de ti y de tu familia. <br /> Conoce nuestros servicios.
                        </p>
                    </div>

                    <div className="text-center mt-5">
                        <button
                            type="button"
                            className="text-15px text-white font-medium bg-lightblue py-5 px-9 mt-2 leafbutton hover:bg-[#0367A6] transition hover:text-[white] border border-lightgrey"
                            onClick={() => onNavigate("servicios")}
                        >
                            Nuestros Servicios
                        </button>
                        <button
                            type="button"
                            className="text-15px ml-4 mt-2 text-blue transition duration-150 ease-in-out hover:text-white hover:bg-blue transition font-medium py-5 px-16 border border-lightgrey leafbutton"
                            onClick={() => onNavigate("info")}
                        >
                            Más información
                        </button>
                    </div>

                    {/* Sección de beneficios */}
                    <section
                        className="relative bg-cover bg-center rounded-2xl shadow-lg text-white p-6 sm:p-10 md:p-12 my-10 max-w-7xl mx-auto"
                        style={{ backgroundImage: "url('/assets/banner/montains.svg')" }}
                        aria-labelledby="beneficios-title"
                    >
                        <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
                            <article className="text-center w-32 sm:w-40" aria-label="Soporte">
                                <i className="fa-solid fa-headset text-3xl sm:text-4xl text-white mb-3"></i>
                                <h3 className="font-semibold">Atención medica</h3>
                                <p className="text-sm">Asistencia médica virtual personalizada</p>
                            </article>

                            <article className="text-center w-32 sm:w-40" aria-label="DIAN">
                                <i className="fa-solid fa-check text-3xl sm:text-4xl text-white mb-3"></i>
                                <h3 className="font-semibold">Salud</h3>
                                <p className="text-sm">Diagnósticos certeros y seguimiento personalizado</p>
                            </article>

                            <article className="text-center w-32 sm:w-40" aria-label="Seguridad">
                                <i className="fa-solid fa-lock text-3xl sm:text-4xl text-white mb-3"></i>
                                <h3 className="font-semibold">Seguridad</h3>
                                <p className="text-sm">Tus datos siempre protegidos y se respeterá el principio paciente doctor</p>
                            </article>
                        </div>
                        <div className="p-4 sm:p-6 md:p-8 rounded-xl max-w-3xl mx-auto text-center mt-8">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">+500 usuarios utilizan nuestro sistema</h2>
                            <p className="text-sm sm:text-base md:text-lg leading-relaxed">De manera muy simple puedes unirte a la comunidad</p>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default Banner;
