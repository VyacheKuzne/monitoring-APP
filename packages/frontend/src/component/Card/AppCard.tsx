import React from 'react';
import { App } from '../../interfaces/app';

interface AppCardProps {
  appData: App; // Принят объект типа App
}

function AppCard({ appData }: AppCardProps) {
  return (
    <a 
        className="flex flex-col gap-y-[25px] max-w-[400px] min-h-[200px] p-[30px] bg-white 
        hover:bg-slate-200 rounded-[5px] text-[16px] font-montserrat shadow-xl transition"
        href={`server/`}
    >
        <div className="flex items-center justify-between">
            <span>{appData.name}</span> {/* Выводим название приложения */}
            <div className="flex items-center gap-[10px]">
                <span className="text-[12px]">Статус: Активен</span>
                <div className="bg-[#2FBD12] w-[17px] h-[17px] rounded-full"></div>
            </div>
        </div>
        <div className="grid grid-cols-2 text-[14px]">
            <div className="flex flex-col gap-[15px] text-left ">
                <span>Хост: {appData.parentServer}</span> {/* Выводим ID родительского сервера */}
                <span>Домен: {appData.parentDomain}</span> {/* Выводим ID родительского домена */}
                <span>SSL сертификат</span>
            </div>
            <div className="flex flex-col gap-[15px] text-right">
                <span>без срока</span>
                <span>до: 17.04.2025</span>
                <span>до: 17.04.2025</span>
            </div>
        </div>
    </a>
  );
}

export default AppCard;
