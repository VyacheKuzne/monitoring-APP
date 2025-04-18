import React, { useEffect, useState } from "react";
import ClientSvg from "../../img/ClientSvg.svg";
import { Company } from "../../interfaces/company";
import { useLocation, useParams } from "react-router-dom";

interface ModalBlockProps {
  companiesData: Company[];
}

const allowedPaths = ["/company/"];

export default function ClientButton({ companiesData }: ModalBlockProps) {
  const location = useLocation(); // Берём актуальный путь
  const { idCompany } = useParams();
  const allowedLocation = allowedPaths.some((path) =>
    location.pathname.startsWith(path),
  );

  useEffect(() => {
    initState();
  }, []);

  const [isOpen, setIsOpen] = useState(false); // Состояние, показывающее, открыт ли список
  const rotateAngle = isOpen ? 180 : 0; // Угол поворота

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const initState = () => {
    if (allowedLocation) {
      // Если путь разрешённый, то открываем панель
      setIsOpen(true);
    }
  };

  const clients = companiesData;
  return (
    <>
      <button
        className="flex gap-[8px]"
        onClick={handleClick}
        style={{ transition: "transform 0.3s ease" }}
      >
        <img
          src={ClientSvg}
          alt="Развернуть клиентов"
          className="mt-[1px]"
          style={{
            transform: `rotate(${rotateAngle}deg)`,
            transition: "transform 0.3s ease",
          }}
        />
        <p className="mx-[5%]">Клиент</p>
      </button>
      {isOpen && (
        <div className="ml-[9px] my-[5%]">
          <ul className="text-left border-l-[3px] border-gray-500 px-[3%]">
            {clients.map((client, index) => (
              <li
                className="relative flex items-center px-[5%] py-[3%]"
                key={index}
              >
                {client.idCompany === Number(idCompany) ? (
                  <div className="absolute left-[-14px] min-w-[11px] w-[11px] min-h-[11px] h-[11px] bg-custom-green border-[2px] border-white rounded-full" />
                ) : null}
                <a href={`/company/${client.idCompany}/`}>{client.name}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
