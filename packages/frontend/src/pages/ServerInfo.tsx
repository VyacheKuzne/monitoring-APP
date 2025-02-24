import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import ModalBlock from '../block/ModalBlock';
import InfoBlock from '../block/InfoBlock';
import { Company } from '../interfaces/company';
import { Server } from '../interfaces/server';
import { WhoisData } from '../interfaces/whois';
import CpuInfoCard, { DataPoint } from '../component/system/CpuInfoCard';
import FormCreateServer from '../component/ModalBlock/FormCreateServer';

function ServerInfo() {
  const { idCompany, idServer } = useParams<{ idCompany: string, idServer: string }>();

  const [server, setServer] = useState<Server | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [domain, setDomain] = useState('');
  const [whoisData, setWhoisData] = useState<WhoisData | null>(null);
  const [cpuInfo, setCpuInfo] = useState<any>(null); // Данные процессора
  const [cpuData, setCpuData] = useState<DataPoint[]>([]); // Данные для графика
  const [cpuStats, setCpuStats] = useState<any[]>([]); // Данные последних 10 значений loadCPU

  // Получаем информацию о сервере
  const getServerInfo = async () => {
    axios.get(`http://localhost:3000/company/${idCompany}/server/${idServer}/get`)
      .then(response => {
        setServer(response.data.server);
        setCompany(response.data.company);
      });
  };

  // Запрос на получение данных о процессоре и обновление cpuData для графика
  const getCpuInfo = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/system/all`);
      const cpuData = response.data.cpu; // Извлекаем данные о процессоре

      setCpuInfo(cpuData); // Устанавливаем данные о процессоре

      // Обновляем данные для графика
      const newDataPoint: DataPoint = {
        time: new Date().toLocaleTimeString(),
        value: cpuData.currentLoad, // Используем данные текущей загрузки
      };

      // Добавляем новое значение в график
      setCpuData((prevData) => {
        const updatedData = [...prevData, newDataPoint];

        // Оставляем только последние 10 данных для графика
        if (updatedData.length > 10) {
          updatedData.shift(); // Убираем первое значение, если данных больше 10
        }

        return updatedData;
      });
    } catch (error) {
      console.error('Error fetching CPU data', error);
    }
  };
  // Запрос для получения последних 10 значений loadCPU
  const getCpuStats = async () => {
    try {
      const response = await axios.get('http://localhost:3000/system/cpu-stats');
      const stats = response.data;
      setCpuStats(stats); // Устанавливаем последние 10 значений loadCPU

      // Обновляем данные для графика на основе cpuStats
      const newCpuDataPoints = stats.map((stat: any) => ({
        time: new Date(stat.date).toLocaleTimeString(),
        value: stat.loadCPU, // Загрузка CPU
      }));

      setCpuData(newCpuDataPoints); // Обновляем массив данных для графика
    } catch (error) {
      console.error('Error fetching CPU stats', error);
    }
  };

  useEffect(() => {
    getServerInfo();
    getCpuInfo(); // Запрашиваем данные о процессоре при монтировании компонента
    getCpuStats(); // Запрашиваем последние 10 значений loadCPU

    // Устанавливаем интервал для обновления данных каждую 10 секунд
    const interval = setInterval(() => {
      getCpuInfo(); // Получаем новые данные каждые 10 секунд
      getCpuStats(); // Получаем последние 10 значений loadCPU каждые 10 секунд
    }, 10000); // 10 секунд
    // Очищаем интервал при размонтировании компонента
    return () => clearInterval(interval);
  }, []); // Пустой массив зависимостей, чтобы использовать setInterval только один раз при монтировании
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDomain(event.target.value);
  };
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setWhoisData(null);
    try {
      const response = await axios.get(`http://localhost:3000/?domain=${domain}`);
      setWhoisData(response.data);
    } catch (e: any) {
      console.error(e.message || 'An error occurred');
    }
  };
  const url = [`/company/${company?.idCompany}/`];
  const crumb = [`${server?.hostname}`];

{/* костыль */}

const [domainData, setCompanyData] = useState('https://');

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const inputValue = event.target.value;

  if (!inputValue.startsWith("https://")) {
    return;
  }

  setCompanyData(inputValue);
};
const createServer = async (event: React.FormEvent) => {
  event.preventDefault();
  const domainName = domainData.replace("https://", "");

  axios.post('http://localhost:3000/server/create', {
    name: domainName
  })
};

{/* костыль */}

  return (
    <div className="App font-montserrat grid grid-cols-[300px_auto]">
      <ModalBlock />
      <div className='flex flex-col gap-[3.5%] m-[2%]'>
        <InfoBlock page={company?.name} url={url} crumb={crumb} />

{/* костыль */}
      <form className='flex flex-col gap-5 items-center border-black border-2' onSubmit={createServer}>
        <div className='flex flex-col border-2'>
          <span className='text-left text-[14px] mb-[5px]'>Домейн компании</span>
          <input 
                className='bg-gray-200 rounded-2xl border-black border-2 text-[12px] p-[10px] pr-[30px] placeholder:text-[12px]' 
                type="text" 
                placeholder='Введите Домейн компании'
                value={domainData} 
                onChange={handleChange}
              />
        </div>
        <button className="w-[50%] p-[5px] bg-slate-500 hover:bg-slate-400 rounded-[5px] text-[14px] font-montserrat transition" type="submit">
          Создать
        </button>
      </form>
{/* костыль */}

        <div className='flex w-auto h-auto p-[1.5%] bg-white rounded-[5px] text-[16px] font-montserrat shadow-xl'>
          <div className='flex flex-col gap-[10px] text-left text-[14px]'>
            <span>Ip адрес: {server?.ipAddress ?? ' Загрузка...'}</span>
            <span>Имя хоста: {server?.hostname ?? ' Загрузка...'}</span>
            <span>Местонахождение: {server?.location ?? ' Загрузка...'}</span>
            <span>Операц. система: {server?.os ?? ' Загрузка...'}</span>
          </div>
        </div>

        {/* Компонент для отображения данных процессора */}
        {cpuInfo && cpuData.length > 0 && (
          <CpuInfoCard cpuInfo={cpuInfo} cpuData={cpuData} />
        )}

        <div className='grid grid-cols-3 gap-[2%] w-auto h-auto'>
        </div>
      </div>
    </div>
  );
}

export default ServerInfo;
