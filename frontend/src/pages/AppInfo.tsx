import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";
import ModalBlock from "../block/ModalBlock";
import InfoBlock from "../block/InfoBlock";
import link from "../img/link.svg";
import { Company } from "../interfaces/company";
import { Server } from "../interfaces/server";
import { App, Page } from "../interfaces/app";
import CopySvg from "../img/Copy.svg";
import "./AppInfo.css";

function AppInfo() {
  useEffect(() => {
    getAppInfo();
  }, []);

  const { idCompany, idServer, idApp } = useParams<{
    idCompany: string;
    idServer: string;
    idApp: string;
  }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [server, setServer] = useState<Server | null>(null);
  const [app, setApp] = useState<App | null>(null);
  const url = [
    `/company/${idCompany}/`,
    `/company/${idCompany}/server/${idServer}/`,
    "",
  ];
  const crumb = [`${company?.name}`, `${server?.hostname}`, `${app?.name}`];

  const [appPage, setAppPage] = useState<Page[]>([]);

  const getAppInfo = async () => {
    try {
      const response = await axios.get(
        `http://89.104.65.22:3000/company/${idCompany}/server/${idServer}/app/${idApp}/get`,
      );

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
  const headers = [
    "Название страницы",
    "Статус работы",
    "URL",
    "История проверок",
  ];

  const timeOutRef = useRef<NodeJS.Timeout | null>(null); // Ссылка на тайм-аут
  const [isVisibleMessage, setIsVisibleMessage] = useState(false); // Состояние видимости сообщения
  const [messageKey, setMessageKey] = useState(0); // Ключ для принудительного перерисовывания
  const [isUrlMessage, setisUrlMessage] = useState<boolean>(false);
  const copyUrl = (urlPage: string) => {
    navigator.clipboard.writeText(urlPage);

    // Скрываем сообщение сразу
    setIsVisibleMessage(false);

    // Если тайм-аут существует, очищаем его
    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
    }

    // Принудительно сбрасываем ключ компонента, чтобы сбросить анимацию
    setMessageKey((prev) => prev + 1);

    // Устанавливаем новый тайм-аут для отображения сообщения
    timeOutRef.current = setTimeout(() => {
      setIsVisibleMessage(true);

      // Устанавливаем тайм-аут для скрытия сообщения через 2 секунды
      setTimeout(() => setIsVisibleMessage(false), 2000);
    }, 10); // Задержка для сброса анимации
  };
  function showFullUrl(key: string, index: number) {
    let showFullUrlBlock: HTMLElement | null;
    showFullUrlBlock = document.querySelector(`[data-key = "${key}-${index}"]`);
    if (showFullUrlBlock) {
      showFullUrlBlock.style.display = "block";
    }
  }
  function closeFullUrl(key: string, index: number) {
    let showFullUrlBlock: HTMLElement | null;
    showFullUrlBlock = document.querySelector(`[data-key = "${key}-${index}"]`);
    if (showFullUrlBlock) {
      showFullUrlBlock.style.display = "none";
    }
  }
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Загрузка';

    const termDate = new Date(date); // Преобразуем в объект Date
    const nowDate = new Date();
  
    return termDate > nowDate ? `до: ${termDate.toLocaleDateString()}` : 'истёк';
  }

  const navigate = useNavigate();
  const navigateToHistory = (idPage: number) => () => {
    navigate(`page/${idPage}`);
  };

  return (
    <div className="App font-montserrat grid grid-cols-[300px_auto]">
      <ModalBlock />
      <div className="flex flex-col sm:gap-[3.5vh] m-[2%]">
        <InfoBlock url={url} crumb={crumb} />
        <div className="bg-white rounded-[5px] p-[30px]  shadow-xl">
          <div className="grid grid-cols-[auto_auto] max-w-[500px] gap-[15px]">
            <span className="text-left text-[14px]">Домен: {app?.domain?.name}</span>
            <span className="text-left text-[12px]">{formatDate(app?.domain?.expires)}</span>
            <span className="text-left text-[14px]">SSL сертификаты:</span>
            <div className="flex flex-col gap-[10px]">
              {app?.domain?.SSL.map((SSL, index) => (
                <div key={index}>
                  <div className="relative flex gap-[10px] items-center "
                    onMouseEnter={() => showFullUrl('ssl', index)}
                    onMouseLeave={() => closeFullUrl('ssl', index)} 
                  >
                    <div className={`w-[7px] h-[7px] rounded-full 
                      ${SSL.expires && new Date(SSL.expires) > new Date() ? 'bg-custom-green' : 'bg-custom-red'}`} />
                    <span className="text-left text-[12px]">
                      {formatDate(SSL.expires)}
                    </span>
                  </div>
                  <div
                    className="hidden absolute bg-white rounded-md p-4 w-[200px]  z-20 shadow-xl"
                    data-key={`ssl-${index}`}
                  >
                    <p className="text8-16px break-all">
                      Осталось {SSL.expires
                      ? Math.round(
                          (new Date(SSL.expires).getTime() - new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : "Неизвестно"} дней
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <span className="text-left text-[14px]">Всего {appPage.length} страниц</span>
          </div>
        </div>
        <div className="bg-white rounded-[10px] shadow-xl">
          {appPage.length > 0 ? (
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
              <tbody>
                {appPage.map((page, index) => (
                  <tr
                    key={page.idPage}
                    className={`${index % 2 === 0 ? "bg-color-bg" : "bg-white"}`}
                  >
                    <td className="class-td text-left">{page.title}</td>
                    <td className="flex justify-center class-td">
                      <div className="flex gap-[10px] items-center">
                        <span className="text8-16">{page.checkPage && page.checkPage[0]?.statusLoadPage === "200" ? 'Активна' : 'Упала'}</span>
                        <div className={`min-w-[17px] min-h-[17px] rounded-full ${page.checkPage && page.checkPage[0]?.statusLoadPage === "200" ? 'bg-custom-green' : 'bg-custom-red'}`} />
                      </div>
                    </td>
                    <td className="class-td">
                      <button
                        onClick={() => copyUrl(page.urlPage)}
                        className="flex gap-[5px]"
                      >
                        <p
                          className="w-auto max-w-[350px] overflow-x-hidden whitespace-nowrap cursor-pointer text-left"
                          onMouseEnter={() => showFullUrl('url', index)}
                          onMouseLeave={() => closeFullUrl('url', index)}

                        >
                          {page.urlPage}
                        </p>
                        <img src={CopySvg} alt="Копировать url" className="mb-[7px]" />
                      </button>
                      <div
                        className="hidden absolute bg-white rounded-md p-4 w-[200px] z-20 shadow-xl"
                        data-key={`url-${index}`}
                      >
                        <p className="break-all">{page.urlPage}</p>
                      </div>
                    </td>
                    <td className="flex justify-center class-td w-full">
                      <button className="flex gap-[5px]" onClick={navigateToHistory(page.idPage)}>
                        <p>Подробнее</p>
                        <img
                          src={link}
                          alt="подробнее"
                          className="mb-[7px]"
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Нет данных</p>)
          }
        </div>
        
        {isVisibleMessage && (
          <div
            key={messageKey}
            className="bg-white w-fit p-[10px] rounded-[5px] z-10 fixed right-[30px] message-box shadow-lg"
          >
            <p className="px-[10px] py-[5px]">URL скопирован!</p>
            <div className="progress-bar animate-progress"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AppInfo;
