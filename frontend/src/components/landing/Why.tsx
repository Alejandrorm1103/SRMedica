interface whydata {
  heading: string;
  subheading: string;
}

const whydata: whydata[] = [
  {
    heading: "Calidad",
    subheading:
      "Todos nuestros especialistas están rigurosamente verificados y acreditados, garantizando un diagnóstico preciso y un tratamiento seguro en cada consulta.",
  },
  {
    heading: "Comunicación Clara y Humana",
    subheading:
      "Fomentamos una interacción directa y empática a través del video chat, permitiendo una comunicación médico-paciente efectiva y resolviendo todas tus dudas con claridad.",
  },
  {
    heading: "Fiabilidad y Seguridad de la Plataforma",
    subheading:
      "Nuestra tecnología es robusta y cumple con los más altos estándares de privacidad (cifrado de extremo a extremo), asegurando que tus datos e historial médico permanezcan completamente confidenciales y accesibles 24/7.",
  },
];

const Why = () => {
  return (
    <div id="about">
      <div className="mx-auto max-w-7xl px-4 my-20 sm:py-20 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* COLUMN-1 */}
          <div className="flex justify-center lg:justify-start">
            <img
              src="/assets/why/doc.png"
              alt="Doctor image"
              width={448}
              height={672}
              className="rounded-lg shadow-xl"
            />
          </div>

          {/* COLUMN-2 */}
          <div>
            <h3 className="text-4xl lg:text-5xl pt-4 font-semibold sm:leading-tight mt-5 text-center lg:text-start">
              ¿Por qué elegirnos?
            </h3>
            <h4 className="text-lg pt-4 font-normal sm:leading-tight text-center text-beach lg:text-start">
              No comprometas tu salud por falta de tiempo. Accede a atención médica de calidad cuando y donde la necesites, simplificando tu bienestar y garantizando el mejor cuidado.
            </h4>

            <div className="mt-10">
              {whydata.map((items, i) => (
                <div className="flex mt-6" key={i}>
                  <div className="rounded-full h-8 w-8 flex items-center justify-center bg-circlebg flex-shrink-0">
                    <img
                      src="/assets/why/check.svg"
                      alt="check-image"
                      width={16}
                      height={16}
                    />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-2xl font-semibold">{items.heading}</h4>
                    <h5 className="text-lg text-beach font-normal mt-2">
                      {items.subheading}
                    </h5>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Why;
