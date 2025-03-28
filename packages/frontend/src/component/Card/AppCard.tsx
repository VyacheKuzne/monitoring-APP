import { useState, useEffect } from "react";
import { App } from "../../interfaces/app";
import axios from "axios";

interface AppCardProps {
  appData: App; // Принят объект типа App
}

function AppCard({ appData }: AppCardProps) {

  const [status, setStatus] = useState<false>();
  const newInterval = 60000;

  useEffect(() => {
    checkStatus();

    const interval = setInterval(() => {
      checkStatus();
    }, newInterval);
    return () => clearInterval(interval);
  }, [])

  const checkStatus = async () => {
    try {
      // console.log(`http://localhost:3000/pages/status/${appData.idApp}`)
      const responseStatus = await axios.get(`http://localhost:3000/pages/status/app/${appData.idApp}`);
      setStatus(responseStatus.data);
    }
    catch {
      setStatus(false);
    }
  }

  return (
    <a
      className="flex flex-col gap-y-[25px] max-w-[400px] min-h-[200px] p-[30px] bg-white 
        hover:bg-slate-200 rounded-[5px] text-[16px] font-montserrat shadow-xl transition"
      href={`app/${appData.idApp}/`}
    >
      <div className="flex items-center justify-between">
        <span>{appData.name}</span> {/* Выводим название приложения */}
        {status ?
          <div className="flex items-center gap-[10px]">
            <span className="text-[12px]">Статус: Активен</span>
            <div className="bg-custom-green w-[17px] h-[17px] rounded-full"></div>
          </div>
          :
          <div className="flex items-center gap-[10px]">
            <span className="text-[12px]">Статус: Упал бедняга</span>
            <div className="bg-custom-red w-[17px] h-[17px] rounded-full"></div>
          </div>
        }
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-[15px] text-[14px]">
        <div className="text-left">
          <span>Домен: {appData.domain?.name || "Загрузка"}</span>
        </div>
        <div className="flex items-center justify-end auto text-[12px]">
          <span>
            до{" "}
            {appData.domain?.expires
              ? new Date(appData.domain.expires).toLocaleDateString()
              : "Загрузка"}
          </span>
        </div>
        <div className="text-left">
          <span>SSL сертификат</span>
        </div>
        <div className="flex items-center justify-end auto text-[12px]">
          <span>
            до{" "}
            {appData.domain?.SSL[0]?.expires
              ? new Date(appData.domain?.SSL[0]?.expires).toLocaleDateString()
              : "Загрузка"}
          </span>
        </div>
      </div>
    </a>
  );
}

export default AppCard;
