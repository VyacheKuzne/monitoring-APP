import React, { useEffect, useState } from "react";
import SearchSvg from "../../img/SearchSvg.svg";
import transitArrow from "../../img/transitArrow.svg";
import axios from "axios";
import { Company } from "../../interfaces/company";

export default function ServerFilter() {

  const [filterName, setFilterName] = useState<string>('');
  const [greenChecked, setGreenChecked] = useState<boolean>(false);
  const [redChecked, setRedChecked] = useState<boolean>(false);

  const [servers, setServers] = useState<Company[]>([]);
  const [serversStatus, setServersStatus] = useState<boolean[]>([]);
  const newInterval = 60000;

  useEffect(() => {
    filterServers(false, false); // Загружаем серверы первый раз
  }, []); 
  
  useEffect(() => {
    if (servers.length > 0) { // Запускаем checkStatus только когда servers загружены
      checkStatus();
      
      const interval = setInterval(() => {
        checkStatus();
      }, newInterval);
  
      return () => clearInterval(interval);
    }
  }, [servers]);

  const filterServers = async (greenCheck: boolean, redCheck: boolean) => {

      const filterStatus: boolean[] = [greenCheck, redCheck];

      const filterData = await axios.post(`http://localhost:3000/companies/filter`, 
      {
          name: filterName,
          status: filterStatus
      });

      setServers(filterData.data.company); // Устанавливаем статусы серверов
      setServersStatus(filterData.data.status)
  };

  const checkStatus = async () => {

    const checkedStatus = await Promise.all(
      servers.map(async (company) => {

        if (!company.server.length) {

          return false; // Если серверов нет, возвращаем false
        }
        else {
          let okay = 0;
          let notOkay = 0;

          await Promise.all(
            company.server.map(async (server) => {
              try {
                const response = await axios.get(`http://localhost:3000/system/status/${server.idServer}`);
                okay++;
                return response.data;
              } 
              catch {
                notOkay++;
                return false;
              }
            })
          );
          const result = okay > notOkay ? true : false;
          return result;
        }
      })
    )
    setServersStatus(checkedStatus.flat());
  }

  return (
    <>
      <div className="min-w-[250px] max-w-[380px] max-h-[500px] bg-white rounded-md text-left p-[1.5%] shadow-lg">
        <p className="text8-16px">Статус работы серверов</p>
        <div className="h-[1px] bg-gray-500 my-[4.5%]" content=""></div>
        <div className="h-[35px]">
          <div className="flex content-center gap-[15px] w-auto h-full">
          <form className="relative flex items-center w-auto z-[100]" 
          onSubmit={(event) => {
            event.preventDefault(); // Чтобы не перезагружалась страница
            filterServers(greenChecked, redChecked); // Перезапускаем фильтрацию только по кнопке отправки
          }}>
              <input
                type="text"
                className="bg-gray-200 w-full h-[35px] rounded-full text-[12px] pl-[35px] pr-[3em]"
                placeholder="Найти сервер"
                value={filterName}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFilterName(event.target.value)}
              />
              <img
                  src={SearchSvg}
                  alt="Кнопка поиска"
                  className="absolute h-[20px] w-[1.2em] ml-[10px]"
              />
            </form>
            <div className="flex h-full items-center gap-[10px]">
              <label className={`border-[2px] border-custom-green min-h-[17px] h-[17px] min-w-[17px] w-[17px] rounded-full ${greenChecked ? 'bg-custom-green' : null}`}>
                  <input
                    type="checkbox"
                    className="opacity-0"
                    checked={greenChecked}
                    onChange={() => {
                      setGreenChecked(!greenChecked);
                      setRedChecked(false);
                      filterServers(!greenChecked, false);
                    }}
                  />
                </label>
                <label className={`border-[2px] border-custom-red min-h-[17px] h-[17px] min-w-[17px] w-[17px] rounded-full ${redChecked ? 'bg-custom-red' : null}`}>
                  <input
                    type="checkbox"
                    className="opacity-0"
                    checked={redChecked}
                    onChange={() => {
                      setRedChecked(!redChecked);
                      setGreenChecked(false);
                      filterServers(false, !redChecked);
                    }}
                  />
                </label>
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
