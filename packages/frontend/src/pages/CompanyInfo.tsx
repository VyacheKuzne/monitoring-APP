import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import ModalBlock from '../block/ModalBlock'
import InfoBlock from '../block/InfoBlock'
import { CompanyData } from '../interfaces/company';
import { Server } from '../interfaces/server';
import ServerCard from '../component/Card/ServerCard';
import PlusSvg from '../img/Plus.svg'
function CompanyInfo() {

  useEffect(() => {
    getCompanyInfo();
  }, []);

  const { idCompany } = useParams<{ idCompany: string }>();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [server, setServer] = useState<Server[]>([]);

  const getCompanyInfo = async () => {
    try {
      // Получаем информацию о компании
      const companyResponse = await axios.get(`http://localhost:3000/company/${idCompany}/get`);
      setCompany(companyResponse.data); // Обновляем данные компании
  
      // Получаем информацию о серверах компании
      const serverResponse = await axios.get(`http://localhost:3000/company/${idCompany}/servers/get`);
      setServer(serverResponse.data); // Обновляем данные серверов
    } catch (error) {
      console.error('Ошибка при получении данных компании или серверов:', error);
    }
  };
  
  const createServer = async (event: React.FormEvent) => {
    event.preventDefault();
    const domainName = domainData.replace("https://", "");
  
    try {
      // Выполняем POST-запрос для создания сервера и ждём его завершения
      await axios.post('http://localhost:3000/server/create', {
        idCompany: idCompany,
        name: domainName
      });
  
      // После успешного добавления сервера, вызываем обновление данных компании и серверов
      await getCompanyInfo();
  
    } catch (error) {
      console.error('Ошибка при создании сервера:', error);
    }
  };
  
  const getCompanyName = (): string => {
    if (!company) {
      return "";
    }
    if (Array.isArray(company)) {
      return company.length > 0 ? company[0].name : "Нет данных";
    } 
    return company.name;
  };

const [domainData, setCompanyData] = useState('https://');

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const inputValue = event.target.value;

  if (!inputValue.startsWith("https://")) {
    return;
  }
  setCompanyData(inputValue);
};


const [Modal, setModal] = useState<boolean>(false)
const showModal = () => {
  setModal(true)
}
const closeModal = () => {
  setModal(false)
}
  return (
    <div className="App font-montserrat grid grid-cols-[300px_auto]">
      <ModalBlock/>
      <div className='flex flex-col gap-y-[3.5vh] m-[2%]'>
        <InfoBlock crumb={[getCompanyName()]} />
        <div className='grid grid-cols-3 gap-x-[2%] gap-y-[3.5vh] w-auto h-auto'>
          {server.map((serverItem, index) => (
            <ServerCard key={serverItem.idServer} serverData={serverItem} />
          ))}
        <button onClick={showModal} className='flex justify-center items-center max-w-[400px] min-h-[200px] p-[30px] bg-white 
        hover:bg-slate-200 rounded-[5px] text-[16px] font-montserrat shadow-xl transition '>
         <img src={PlusSvg} className='w-[30px] h-[30px] mx-3' alt="Закрыть модальное окно" /> 
         <p>Добавить сервер</p>
        </button>
        {Modal && (
           <div className='w-screen h-screen absolute flex justify-center items-center bg-color-fon z-10 top-0 left-0'>
              {/* блок контента */}
              <div className='bg-white  rounded-[5px] p-2 flex flex-col'>
                {/* верхняя часть дива с кнопкой для закрытия блока */}
                <div className='flex flex-row-reverse'>
                  <button className='rotate-45 select-none' onClick={closeModal}>
                   <img src={PlusSvg} alt="Закрыть модальное окно" />
                 </button>
                </div>
                {/* форма для запоолнения */}
                <form className='flex flex-col gap-5 items-center w-[450px] h-[150px' onSubmit={createServer}>
                 <div className='flex flex-col'>
                   <span className='text-left text-[20px] mb-[5px]'>Введите Домейн компании</span>
                   <input 
                         className='bg-gray-200 rounded-2xl text-[16px] p-[10px] pr-[30px] placeholder:text-[12px]' 
                         type="text" 
                         placeholder='Введите Домейн компании'
                         value={domainData} 
                         onChange={handleChange}
                       />
                 </div>
                 <button className="w-[50%] p-[5px]  bg-slate-300 hover:bg-slate-400 rounded-[5px] text-[14px] font-montserrat transition" type="submit">
                   <p>Создать</p>
                 </button>
               </form>
              </div>
            </div>
        )}
        </div>
      </div>
    </div>
  );
}
export default CompanyInfo;
