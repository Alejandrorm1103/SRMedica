interface datatype {
  imgSrc: string;
  country: string;
  paragraph: string;
}

const Aboutdata: datatype[] = [
  {
    imgSrc: "/assets/network/colombia.svg",
    country: "Colombia",
    paragraph: "Servicio de telemedicina disponible en todo el territorio nacional.",
  },
  {
    imgSrc: "/assets/network/latam.svg",
    country: "Latinoamérica",
    paragraph: "Expandiendo nuestros servicios a toda la región latinoamericana.",
  },
  {
    imgSrc: "/assets/network/spain.svg",
    country: "España",
    paragraph: "Conectando pacientes y médicos en la península ibérica.",
  },
  {
    imgSrc: "/assets/network/global.svg",
    country: "Global",
    paragraph: "Nuestra visión es llevar salud de calidad a todo el mundo.",
  },
];

const Network = () => {
  return (
    <div className="bg-babyblue" id="project">
      <div className="mx-auto max-w-2xl py-20 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <h3 className="text-4xl sm:text-6xl font-semibold text-center my-10 lh-81">
          Nuestra red global <br /> de servicios médicos.
        </h3>

        <img
          src="/assets/network/map.png"
          alt="map-image"
          width={1400}
          height={800}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-16 gap-y-4 lg:gap-x-8">
          {Aboutdata.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-xl">
              <div className="flex justify-start items-center gap-2">
                <img
                  src={item.imgSrc}
                  alt={item.country}
                  width={55}
                  height={55}
                  className="mb-2 rounded-full w-[55px] h-[55px] object-cover shadow-sm"
                />
                <h4 className="text-xl font-medium text-midnightblue">
                  {item.country}
                </h4>
              </div>
              <hr />
              <h4 className="text-lg font-normal text-bluegrey my-2">
                {item.paragraph}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Network;
