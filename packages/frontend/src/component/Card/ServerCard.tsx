import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Server } from '../../interfaces/server';

interface getServerData {
    serverData: Server;
}

function ServerCard({ serverData }: getServerData) {

  return (
    <a 
        className="flex flex-col gap-y-[25px] max-w-[400px] min-h-[200px] p-[30px] bg-white 
        hover:bg-slate-200 rounded-[5px] text-[16px] font-montserrat shadow-xl transition"
        href={`server/${serverData.idServer}`}
    >

        <div className='flex items-center justify-between'>
            <span>Сервер №{serverData.idServer}</span>
            <div className='flex items-center gap-[10px]'>
                <span className='text-[12px]'>Статус: Активен</span>
                <div className='bg-[#2FBD12] w-[17px] h-[17px] rounded-full'></div>
            </div>
        </div>
        <div className='grid grid-cols-2 text-[14px]'>
            <div className='flex flex-col gap-[15px] text-left '>
                <span>Хост: {serverData.hostname}</span>
                <span>Домен: fox-pizza.ru</span>
                <span>SSL сертификат</span>
            </div>
            <div className='flex flex-col gap-[15px]  text-right'>
                <span>без срока</span>
                <span>до: {serverData.domain?.registered ? serverData.domain.registered.toLocaleDateString() : 'без срока'}</span>

                <span>до: 17.04.2025</span>
            </div>
        </div>
    </a>
  );
}
export default ServerCard;
