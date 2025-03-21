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
        href={`server/${serverData.idServer}/`}
    >

        <div className='flex items-center justify-between'>
            <span>Сервер №{serverData.idServer}</span>
            <div className='flex items-center gap-[10px]'>
                <span className='text-[12px]'>Статус: Активен</span>
                <div className='bg-[#2FBD12] w-[17px] h-[17px] rounded-full'></div>
            </div>
        </div>
        <div className='grid grid-cols-[1fr_auto] gap-[15px] text-[14px]'>
            <div className='col-span-2 text-left '>
                <span>Ip-адрес: {serverData.ipAddress}</span>
            </div>
            <div className='text-left'>
                <span>Имя хоста: {serverData.hostname}</span>
            </div>
            <div className='flex items-center justify-end auto text-[12px]'>
                <span>без срока</span>
            </div>
            <div className='col-span-2 text-left'>
                <span>Местонахождение: {serverData.location}</span>
            </div>
            <div className='col-span-2 text-left'>
                <span>Операц. система: {serverData.os}</span>
            </div>
        </div>
    </a>
  );
}
export default ServerCard;
