import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import ModalBlock from '../block/ModalBlock';
import InfoBlock from '../block/InfoBlock';
import { assert } from 'console';
import link from '../img/link.svg'

import { CheckPage } from '../interfaces/app';
// import { Server } from '../interfaces/server';
// import { App } from '../interfaces/app';
// import { WhoisData } from '../interfaces/whois';
// import CpuInfoCard, { DataPoint } from '../component/system/CpuInfoCard';
// import FormCreateServer from '../component/ModalBlock/FormCreateServer';
// import PlusSvg from '../img/Plus.svg'
// import AppCard from '../component/Card/AppCard';

function AppInfo() {
  useEffect(()=>{
    getAppInfo()
  },[])
  const { idCompany, idApp } = useParams<{ idCompany: string; idApp: string }>();

  // Преобразуем параметры в числа
  const companyId = useMemo(() => Number(idCompany), [idCompany]);
  const appId = useMemo(() => Number(idApp), [idApp]);

  const [appPage, setAppPage] = useState<CheckPage[]>([]);

  const getAppInfo = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/company/${companyId}/server/app/${appId}`);
      console.log(response);

      if (!response.data.pageInfo) {
        console.log("Отсутствуют данные о страницах");
      } else {
        console.log("Данные успешно получены");
        setAppPage(response.data.pageInfo); // Обновляем состояние
      }
    } catch (error) {
      console.error("Ошибка запроса:", error);
    }
  };
  // обьявяляем масив для работы с заголовками таблицы
  const headers = ["id", "Статус загрузки контента", "Статус загрузки медиа", "Статус загрузки DOM", 'Статус загрузки стилей', 'Статус загрузки скриптов', "Время ответа", 'История'];
  // if ({appPage.statusLoadMedia} == 'failed') {
                      
  // }
return (
  <div className="App font-montserrat grid grid-cols-[300px_auto]">
    <ModalBlock />
    <div className='flex flex-col gap-[3.5%] m-[2%]'>
      <InfoBlock/>

      <div className='flex w-auto h-auto my-[30px] p-[1.5%] bg-white rounded-[5px] text-[16px] font-montserrat shadow-xl'>
        <div className='flex flex-col gap-[10px] text-left text-[14px]'>
          Приложение №{idApp}
        </div>
      </div>
      {/* отображение данных о страницах */}
      <div className="bg-white rounded-[10px]">
        {appPage.length > 0 ? (
          <table className='w-full'>
            {/* Заголовки таблицы */}
              <tr className='border'>
                {headers.map((header, index) => (
                  <td className='p-[30px]' key={index}>{header}</td>
                ))}
              </tr>

            {/* Данные таблицы */}
            {appPage.map((page, index) => (
              <tr key={page.idCheckPage} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-200'}>
                <td className='p-[30px]'>{page.idCheckPage}</td>
                <td className='p-[30px]'>
                  {page.statusLoadContent === 'Content fully loaded' ? (
                    <p className="text-green-500">Страница успешно загружена</p>
                  ) : (
                    <p className="text-slate-600">При загрузке страницы возникли проблемы</p>
                  )}
                </td>
                <td className='p-[30px]'>
                  {page.statusLoadMedia === 'Failed' ? (
                    <p className="text-red-500">Ошибка загрузки медиа</p>
                  ) : (
                    <p className="text-slate-600">Медиа загружены</p>
                  )}
                </td>
                <td className='p-[30px]'>
                  {page.statusLoadDOM === 'Failed' ? (
                    <p className="text-red-500">Ошибка загрузки DOM</p>
                  ) : (
                    <p className="text-slate-600">DOM загружен</p>
                  )}
                </td>
                <td className='p-[30px]'>
                  {page.statusLoadStyles === 'Failed' ? (
                    <p className="text-red-500">Ошибка загрузки стилей</p>
                  ) : (
                    <p className="text-slate-600">Стили загружены</p>
                  )}
                </td>
                <td className='p-[30px]'>
                  {page.statusLoadScripts === 'Failed' ? (
                    <p className="text-red-500">Ошибка загрузки скриптов</p>
                  ) : (
                    <p className="text-slate-600">Скрипты загружены</p>
                  )}
                </td>
                <td className='p-[30px]'>{page.responseTime}мс.</td>
                <td className='p-[30px] max-w-fit relative'>
                  <button>
                    <p>Подробнее
                      <img src={link} alt="подробнее" className='absolute right-[10%] top-[38%]'/>
                    </p>
                  </button>
                </td>
              </tr>
            ))}
          </table>
        ) : (
          <p>Нет данных</p>
        )}
      </div>
    </div>
  </div>
      
);

}

export default AppInfo;
