import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import ModalBlock from '../block/ModalBlock'
import InfoBlock from '../block/InfoBlock'
import { CompanyData } from '../interfaces/company';

function CompanyInfo() {

  useEffect(() => {
    getCompanyInfo();
  }, []);

  const { idCompany } = useParams<{ idCompany: string }>();
  console.log()
  const [company, setCompany] = useState<CompanyData | null>(null);

  const getCompanyInfo = async () => {
    axios.get(`http://localhost:3000/company/${idCompany}/get`)
    .then(response => 
    {
        setCompany(response.data);
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
    <div className="App font-montserrat grid grid-cols-[300px_84%]">
      <ModalBlock/>
      <InfoBlock page={getCompanyName()} />
    </div>
  );
}
export default CompanyInfo;
