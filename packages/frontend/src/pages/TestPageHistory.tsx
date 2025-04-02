import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../App.css";
import ModalBlock from "../block/ModalBlock";
import InfoBlock from "../block/InfoBlock";
import { Company } from "../interfaces/company";
import { Server } from "../interfaces/server";
import { App, Page, CheckPage } from "../interfaces/app";
import "./AppInfo.css";

function TestPageHistory() {
  useEffect(() => {
    getPageInfo();
  }, []);

  const { idCompany, idServer, idApp, idPage } = useParams<{
    idCompany: string;
    idServer: string;
    idApp: string;
    idPage: string;
  }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [server, setServer] = useState<Server | null>(null);
  const [appPage, setAppPage] = useState<Page | null>(null);
  const [appCheckPage, setAppCheckPage] = useState<CheckPage[]>([]);

  const [app, setApp] = useState<App | null>(null);
  const url = [
    `/company/${idCompany}/`,
    `/company/${idCompany}/server/${idServer}/`,
    `/company/${idCompany}/server/${idServer}/app/${idApp}`,
    "",
  ];
  const crumb = [`${company?.name}`, `${server?.hostname}`, `${app?.name}`, 'История проверок'];


  const getPageInfo = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/company/${idCompany}/server/${idServer}/app/${idApp}/page/${idPage}/get`,
      );

      if (!response.data.pageInfo) {
        console.log("Отсутствуют данные о страницах");
      } else {
        console.log("Данные успешно получены");
        setApp(response.data.app);
        setAppPage(response.data.pageInfo); // Обновляем состояние
        setAppCheckPage(response.data.checkPageInfo); 
        setCompany(response.data.company);
        setServer(response.data.server);
      }
    } catch (error) {
      console.error("Ошибка запроса:", error);
    }
  };
  // обьявяляем масив для работы с заголовками таблицы
  const headers = [
    "Статус загрузки контента",
    "Статус загрузки медиа",
    "Статус загрузки стилей",
    "Статус загрузки скриптов",
    "Время ответа",
    "Дата проверки",
  ];

  const formatDate = (date: Date) => {
    const dateObject = new Date(date);
    return `${String(dateObject.getDate()).padStart(2, "0")}.${String(dateObject.getMonth() + 1).padStart(2, "0")}.${dateObject.getFullYear()} в
        ${String(dateObject.getHours()).padStart(2, "0")}:${String(dateObject.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div className="App font-montserrat grid grid-cols-[300px_auto]">
      <ModalBlock />
      <div className="flex flex-col sm:gap-[3.5vh] m-[2%]">
        <InfoBlock url={url} crumb={crumb} />

        {/* отображение данных о страницах */}
        <div className="bg-white rounded-[10px] shadow-xl">
          <div className="grid grid-cols-[85%_15%] gap-[15px] text-left px-[30px] pt-[30px] pb-[15px]">
            <p className="text12-16px">Страница: {appPage?.title ? appPage?.title : 'Загрузка'}</p>
            <div className="flex justify-end gap-[10px] items-center">
              <span className="text10-12px">
                {appCheckPage[0]?.statusLoadPage === "200" ? 'Страница активна' : 'Страница упала'}
              </span>
              <div className={`min-w-[17px] min-h-[17px] rounded-full 
                ${appCheckPage[0]?.statusLoadPage === "200" ? 'bg-custom-green' : 'bg-custom-red'}`} />
            </div>
            <hr className="h-[2px] col-span-full bg-slate-600" />
            
          </div>
          {appCheckPage.length > 0 ? (
            <table className="w-full">
              {/* Заголовки таблицы */}
              <thead>
                <tr className="border-0">
                  {headers.map((header, index) => (
                    <td className="class-td" key={index}>
                      {header}
                    </td>
                  ))}
                </tr>
              </thead>
              {/* Данные таблицы */}
              <tbody>
                {appCheckPage.map((check, index) => (
                  <tr
                    key={check.idCheckPage}
                    className={index % 2 === 0 ? "bg-color-bg" : "bg-white"}
                  >
                    {/* <td className='class-td'>{page.idCheckPage}</td> */}
                    <td className="class-td">
                      {check.statusLoadContent === "Content fully loaded" ? (
                        <p className="text-custom-green">
                          Страница успешно загружена
                        </p>
                      ) : (
                        <p className="text-slate-600">
                          При загрузке страницы возникли проблемы
                        </p>
                      )}
                    </td>
                    <td className="class-td">
                      {check.statusLoadMedia === "Failed" ? (
                        <p className="text-custom-red">Ошибка загрузки медиа</p>
                      ) : (
                        <p className="text-slate-600">Медиа загружены</p>
                      )}
                    </td>
                    <td className="class-td">
                      {check.statusLoadStyles === "Failed" ? (
                        <p className="text-custom-red">Ошибка загрузки стилей</p>
                      ) : (
                        <p className="text-slate-600">Стили загружены</p>
                      )}
                    </td>
                    <td className="class-td">
                      {check.statusLoadScripts === "Failed" ? (
                        <p className="text-custom-red">Ошибка загрузки скриптов</p>
                      ) : (
                        <p className="text-slate-600">Скрипты загружены</p>
                      )}
                    </td>
                    <td className="class-td">{check.responseTime}мс.</td>
                    <td className="class-td">{formatDate(check.date)}</td>
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

export default TestPageHistory;
