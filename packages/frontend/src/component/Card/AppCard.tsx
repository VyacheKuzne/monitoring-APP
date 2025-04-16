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
      const responseStatus = await axios.get(`http://localhost:3000/pages/status/app/${appData.idApp}`);
      setStatus(responseStatus.data);
    }
    catch {
      setStatus(false);
    }
  }

  const formatDate = (date: Date) => {
    const termDate = new Date(date); // Преобразуем в объект Date
    const nowDate = new Date();
  
    return termDate > nowDate ? `до: ${termDate.toLocaleDateString()}` : 'истёк';
  }

  return (
    <a
      className="flex flex-col gap-y-[25px] max-w-[400px] min-h-[200px] p-[30px] bg-white 
        hover:bg-slate-200 rounded-[5px] text-[16px] font-montserrat shadow-xl transition"
      href={`app/${appData.idApp}/`}
      rel="nofollow"
    >
      <div className="flex items-center justify-between">
        <span className="text-left">{appData.name}</span> {/* Выводим название приложения */}
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
          <span>{appData.domain?.expires ? formatDate(appData.domain.expires) : "Загрузка"}
          </span>
        </div>
        <div className="text-left">
          <span>SSL сертификат</span>
        </div>
        <div className="flex items-center justify-end auto text-[12px]">
          <span>{appData.domain?.SSL[0]?.expires ? formatDate(appData.domain?.SSL[0]?.expires) : "Загрузка"}
          </span>
        </div>
      </div>
    </a>
  );
}

export default AppCard;
