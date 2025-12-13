interface FooterProps {
  variant?: 'full' | 'simple';
}

export function Footer({ variant = 'simple' }: FooterProps) {
  if (variant === 'simple') {
    // Footer simple para páginas internas
    return (
      <footer className="bg-gradient-to-r from-blue to-lightblue text-white mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Logo y Copyright */}
            <div className="text-center md:text-left">
              <p className="text-white/90 text-sm">
                © 2025 SRMedica - Todos los derechos reservados
              </p>
            </div>

            {/* Enlaces */}
            <div className="flex gap-6">
              <a
                href="#"
                className="text-white/90 hover:text-white space-links transition-all text-sm"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Términos y Condiciones
              </a>
              <a
                href="#"
                className="text-white/90 hover:text-white space-links transition-all text-sm"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Política de Privacidad
              </a>
              <a
                href="#"
                className="text-white/90 hover:text-white space-links transition-all text-sm"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Contacto
              </a>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Footer completo para Landing
  return (
    <footer className="bg-gradient-to-r from-blue to-lightblue text-white">
      <div className="mx-auto max-w-2xl pt-8 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="mt-8 mb-16 grid grid-cols-1 gap-y-10 gap-x-16 sm:grid-cols-2 lg:grid-cols-12 xl:gap-x-8">
          {/* COLUMN-1 - Logo y Redes */}
          <div className="col-span-4 md:col-span-12 lg:col-span-4">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              SRMedica
            </h2>
            <p className="text-white/90 mb-6">
              Tu salud, nuestra prioridad. Conectando pacientes con los mejores profesionales médicos.
            </p>
            <div className="flex gap-4">
              <a
                href="#!"
                onClick={(e) => e.preventDefault()}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <img
                  src="/assets/footer/facebook.svg"
                  alt="facebook"
                  width={15}
                  height={20}
                />
              </a>
              <a
                href="#!"
                onClick={(e) => e.preventDefault()}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <img
                  src="/assets/footer/twitter.svg"
                  alt="twitter"
                  width={20}
                  height={20}
                />
              </a>
              <a
                href="#!"
                onClick={(e) => e.preventDefault()}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <img
                  src="/assets/footer/instagram.svg"
                  alt="instagram"
                  width={20}
                  height={20}
                />
              </a>
            </div>
          </div>

          {/* COLUMN-2 - Enlaces */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <h4 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Navegación
            </h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/90 hover:text-white space-links">Home</a></li>
              <li><a href="#services" className="text-white/90 hover:text-white space-links">Servicios</a></li>
              <li><a href="#about" className="text-white/90 hover:text-white space-links">Nosotros</a></li>
              <li><a href="#" className="text-white/90 hover:text-white space-links">Contacto</a></li>
            </ul>
          </div>

          {/* COLUMN-3 - Recursos */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <h4 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Recursos
            </h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/90 hover:text-white space-links">Ayuda</a></li>
              <li><a href="#" className="text-white/90 hover:text-white space-links">FAQ</a></li>
              <li><a href="#" className="text-white/90 hover:text-white space-links">Blog</a></li>
              <li><a href="#" className="text-white/90 hover:text-white space-links">Soporte</a></li>
            </ul>
          </div>

          {/* COLUMN-4 - Contacto */}
          <div className="col-span-4 md:col-span-4 lg:col-span-4">
            <h4 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Contacto
            </h4>
            <div className="space-y-4">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-white/30 transition-colors">
                  <img src="/assets/footer/mask.svg" alt="location" width={20} height={20} className="brightness-0 invert" />
                </div>
                <p className="text-white/90 text-sm">Calle Principal 123, Bogotá, Colombia</p>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-white/30 transition-colors">
                  <img src="/assets/footer/telephone.svg" alt="phone" width={20} height={20} className="brightness-0 invert" />
                </div>
                <p className="text-white/90 text-sm">+57 300 123 4567</p>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-white/30 transition-colors">
                  <img src="/assets/footer/email.svg" alt="email" width={20} height={20} className="brightness-0 invert" />
                </div>
                <p className="text-white/90 text-sm">info@srmedica.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="py-6 lg:flex items-center justify-between border-t border-white/20">
          <p className="text-white/90 text-sm text-center lg:text-start">
            © 2025 SRMedica - Todos los derechos reservados
          </p>
          <div className="flex gap-5 mt-4 lg:mt-0 justify-center lg:justify-start">
            <a href="#" className="text-white/90 hover:text-white text-sm">Política de Privacidad</a>
            <div className="h-5 bg-white/20 w-0.5"></div>
            <a href="#" className="text-white/90 hover:text-white text-sm">Términos y Condiciones</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
