import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import ModalBlock from '../block/ModalBlock';
import InfoBlock from '../block/InfoBlock';
import { assert } from 'console';
import link from '../img/link.svg'
import { Company } from '../interfaces/company';
import { Server } from '../interfaces/server';
import { App } from '../interfaces/app';

import { CheckPage } from '../interfaces/app';
// import { WhoisData } from '../interfaces/whois';
// import CpuInfoCard, { DataPoint } from '../component/system/CpuInfoCard';
// import FormCreateServer from '../component/ModalBlock/FormCreateServer';
// import PlusSvg from '../img/Plus.svg'
// import AppCard from '../component/Card/AppCard';

function AppInfo() { 

  useEffect(()=>{
    getAppInfo()
  },[])

  const { idCompany, idServer, idApp } = useParams<{ idCompany: string; idServer: string; idApp: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [server, setServer] = useState<Server | null>(null);
  const [app, setApp] = useState<App | null>(null);
  
  const url = [`/company/${idCompany}/`, `/company/${idCompany}/server/${idServer}/`, ''];
  const crumb = [`${company?.name}`, `${server?.hostname}`, `${app?.name}`];

  const [appPage, setAppPage] = useState<CheckPage[]>([]);

  const getAppInfo = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/company/${idCompany}/server/${idServer}/app/${idApp}/get`);
      console.log(response);
      console.log(typeof(idServer));

      if (!response.data.pageInfo) {
        console.log("Отсутствуют данные о страницах");
      } else {
        console.log("Данные успешно получены");
        setApp(response.data.app);
        setAppPage(response.data.pageInfo); // Обновляем состояние
        setCompany(response.data.company);
        setServer(response.data.server);
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
      <InfoBlock url={url} crumb={crumb} />
      {/* отображение данных о страницах */}
      <div className="bg-white rounded-[10px]">
        {appPage.length > 0 ? (
          <table className='w-full'>
            <tbody>
            {/* Заголовки таблицы */}
              <tr className='border'>
                {headers.map((header, index) => (
                  <td className='class-td' key={index}>{header}</td>
                ))}
              </tr>

            {/* Данные таблицы */}
            {appPage.map((page, index) => (
                <tr key={page.idCheckPage} className={index % 2 === 0 ? 'bg-white' : 'bg-color-bg'}>                <td className='class-td'>{page.idCheckPage}</td>
                <td className='class-td'>
                  {page.statusLoadContent === 'Content fully loaded' ? (
                    <p className="text-green-500">Страница успешно загружена</p>
                  ) : (
                    <p className="text-slate-600">При загрузке страницы возникли проблемы</p>
                  )}
                </td>
                <td className='class-td'>
                  {page.statusLoadMedia === 'Failed' ? (
                    <p className="text-red-500">Ошибка загрузки медиа</p>
                  ) : (
                    <p className="text-slate-600">Медиа загружены</p>
                  )}
                </td>
                <td className='class-td'>
                  {page.statusLoadDOM === 'Failed' ? (
                    <p className="text-red-500">Ошибка загрузки DOM</p>
                  ) : (
                    <p className="text-slate-600">DOM загружен</p>
                  )}
                </td>
                <td className='class-td'>
                  {page.statusLoadStyles === 'Failed' ? (
                    <p className="text-red-500">Ошибка загрузки стилей</p>
                  ) : (
                    <p className="text-slate-600">Стили загружены</p>
                  )}
                </td>
                <td className='class-td'>
                  {page.statusLoadScripts === 'Failed' ? (
                    <p className="text-red-500">Ошибка загрузки скриптов</p>
                  ) : (
                    <p className="text-slate-600">Скрипты загружены</p>
                  )}
                </td>
                <td className='class-td'>{page.responseTime}мс.</td>
                <td className='class-td max-w-fit relative'>
                  <button className='flex'>
                    <p>Подробнее</p>
                    <img src={link} alt="подробнее" className='absolute right-[5%]'/>
                  </button>
                </td>
              </tr>
            ))}
            </tbody>
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
