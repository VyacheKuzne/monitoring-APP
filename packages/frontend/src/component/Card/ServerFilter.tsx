import React, { useEffect, useState } from "react";
import SearchSvg from "../../img/SearchSvg.svg";
import transitArrow from "../../img/transitArrow.svg";
import axios from "axios";
import { Company, CompanyData } from "../../interfaces/company";

export default function ServerCard() {
  useEffect(() => {
    filterServers();
  }, []);

  const [filterName, setFilterName] = useState<string|null>();
  const [filterStatus, setFilterStatus] = useState<boolean|null>();
  const [servers, setServers] = useState<Company[]>([]);
  const [serversStatus, setServersStatus] = useState<boolean[]>([]);

  const filterServers = async () => {
      // Получаем список серверов
      const filterData = await axios.get(`http://localhost:3000/companies/filter`, 
      {
          params: {
            name: filterName,
            status: filterStatus
          }
      });
      
      // setServers(companyData);

      // // Ждём, пока все запросы завершатся
      // const statuses = await Promise.all(
      //   companyData.map(async (server) => {
      //     const response = await axios.get<boolean>(`http://localhost:3000/system/status/${server.idServer}`);
      //     return response.data;
      //   })
      // );

      // setServersStatus(statuses); // Устанавливаем статусы серверов
  };

  return (
    <>
      <div className="min-w-[250px] max-w-[380px] max-h-[500px] bg-white rounded-md text-left p-[1.5%] shadow-lg">
        <p className="text8-16px">Статус работы серверов</p>
        <div className="h-[1px] bg-gray-500 my-[4.5%]" content=""></div>
        <div className="h-[35px]">
          <div className="flex content-center gap-[15px] w-auto h-full">
            <div className="relative flex items-center w-auto z-[100]">
              <input
                type="text"
                className="bg-gray-200 w-full h-[35px] rounded-full text-[12px] pl-[35px] pr-[3em]"
                placeholder="Найти сервер"
              />
              <img
                  src={SearchSvg}
                  alt="Кнопка поиска"
                  className="absolute h-[20px] w-[1.2em] ml-[10px]"
              />
            </div>
            <div className="flex h-full items-center gap-[10px]">
              <button
                content=""
                className="border-[2px] border-custom-green min-h-[17px] h-[17px] min-w-[17px] w-[17px] rounded-full"
              />
              <button
                content=""
                className="border-[2px] border-custom-red min-h-[17px] h-[17px] min-w-[17px] w-[17px] rounded-full"
              />
            </div>
          </div>
        </div>
        <div className="mt-[4.5%]">
          {servers.map((server, index) => (
            <a
              href={`/company/${server.idCompany}/`}
              className="flex gap-[15px] items-center mb-[4.5%]"
              key={index}
            >
              <div className={`min-w-[18px] w-[18px] min-h-[18px] h-[18px] rounded-full ${serversStatus[index] ? `bg-custom-green` : `bg-custom-red`}`} />
              <span className="w-full text8-16px">{server.name}</span>
              <img src={transitArrow} alt="Перейти к серверам" />
            </a>

          ))}
        </div>
      </div>
    </>
  );
}
