import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import ModalBlock from '../block/ModalBlock'
import InfoBlock from '../block/InfoBlock'
import { CompanyData } from '../interfaces/company';
import { Server } from '../interfaces/server';
import ServerCard from '../component/Card/ServerCard';
import CreateServerButton from '../component/Button/CreateServerButton';

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

  return (
    <div className="App font-montserrat grid grid-cols-[300px_auto]">
      <ModalBlock/>
      <div className='flex flex-col gap-[3.5%] m-[2%]'>
        <InfoBlock page={getCompanyName()} />
        <div className='grid grid-cols-3 gap-[2%] w-auto h-auto'>
          {server.map((serverItem, index) => (
            <ServerCard key={serverItem.idServer} serverData={serverItem} />
          ))}
          <CreateServerButton />
        </div>
      </div>
    </div>
  );
}
export default CompanyInfo;
