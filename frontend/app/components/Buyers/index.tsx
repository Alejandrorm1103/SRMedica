import Image from "next/image";
import { getImagePath } from "../../../lib/utils";

interface cardDataType {
  imgSrc: string;
  heading: string;
  percent: string;
  subheading: string;
}

const cardData: cardDataType[] = [
  {
    imgSrc: getImagePath("/assets/buyers/medico.svg"),
    percent: "+150",
    heading: "Médicos",
    subheading: "Sigue el crecimiento total de nuestros especialistas verificados y calificados.",
  },
  {
    imgSrc: getImagePath("/assets/buyers/cita.svg"),
    percent: "+50mil",
    heading: "Citas realizadas",
    subheading: "Sigue el total de consultas virtuales completadas satisfactoriamente.",
  },
  {
    imgSrc: getImagePath("/assets/buyers/satisfaction.svg"),
    percent: "90%",
    heading: "Satisfacción",
    subheading: "Sigue la puntuación media de las valoraciones de nuestros pacientes.",
  },
  {
    imgSrc: getImagePath("/assets/buyers/time.svg"),
    percent: "< 5 min",
    heading: "Tiempo de Espera",
    subheading: "Sigue el tiempo promedio para ser conectado con un médico disponible.",
  },
];

const Buyers = () => {
  return (
    <div className="mx-auto max-w-7xl py-16 px-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-y-20 gap-x-5">
        {cardData.map((items, i) => (
          <div className="flex flex-col justify-center items-center" key={i}>
            <div className="flex justify-center border border-border  p-2 w-10 rounded-lg">
              <Image
                src={items.imgSrc}
                alt={items.imgSrc}
                width={40}
                height={40}
              />
            </div>
            <h2 className="text-4xl lg:text-6xl text-black font-semibold text-center mt-5">
              {items.percent}
            </h2>
            <h3 className="text-2xl text-black font-semibold text-center lg:mt-6">
              {items.heading}
            </h3>
            <p className="text-lg font-normal text-black text-center text-opacity-50 mt-2">
              {items.subheading}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Buyers;
