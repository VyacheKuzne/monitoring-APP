import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import ModalBlock from '../block/ModalBlock'
import InfoBlock from '../block/InfoBlock'
import { CompanyData } from '../interfaces/company';
import { Server } from '../interfaces/server';
import ServerCard from '../component/Card/ServerCard';

function CompanyInfo() {

  useEffect(() => {
    getCompanyInfo();
  }, []);

  const { idCompany } = useParams<{ idCompany: string }>();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [server, setServer] = useState<Server[]>([]);

  const getCompanyInfo = async () => {
    axios.get(`http://localhost:3000/company/${idCompany}/get`)
    .then(response => 
    {
        setCompany(response.data);
        // console.log(response.data);
        axios.get(`http://localhost:3000/company/${idCompany}/servers/get`)
        .then(response => {
          setServer(response.data);
          // console.log(response.data);
        });
    });
  }

  const getCompanyName = (): string => {
    if (!company) {
      return "";
    }
    if (Array.isArray(company)) {
      return company.length > 0 ? company[0].name : "Нет данных";
    } 
    return company.name;
  };
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
    idCompany: idCompany ,
    name: domainName
  })
};

{/* костыль */}

  return (
    <div className="App font-montserrat grid grid-cols-[300px_auto]">
      
      <ModalBlock/>
      {/* костыль */}
      <form className='flex flex-col gap-5 items-center w-[300px] h-[150px] border-black border-2' onSubmit={createServer}>
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
      <div className='flex flex-col gap-[3.5%] m-[2%]'>
        <InfoBlock page={getCompanyName()} />
        <div className='grid grid-cols-3 gap-[2%] w-auto h-auto'>
          {server.map((serverItem, index) => (
            <ServerCard key={serverItem.idServer} serverData={serverItem} />
          ))}
        </div>
      </div>
    </div>
  );
}
export default CompanyInfo;
