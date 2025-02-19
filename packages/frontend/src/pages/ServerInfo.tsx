import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
import '../App.css';
import ModalBlock from '../block/ModalBlock'
import InfoBlock from '../block/InfoBlock'
import { Company } from '../interfaces/company';
import { Server } from '../interfaces/server';
import AppCard from '../component/Card/AppCard';
import CreateServerButton from '../component/Button/CreateServerButton';
import { WhoisData } from '../interfaces/whois';

function ServerInfo() {

  useEffect(() => {
    getServerInfo();
  }, []);

  const { idCompany, idServer } = useParams<{ idCompany: string, idServer: string }>();

  const [server, setServer] = useState<Server | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  
  const [domain, setDomain] = useState('');
  const [whoisData, setWhoisData] = useState<WhoisData | null>(null);
  const [error, setError] = useState('');

  const getServerInfo = async () => {
    axios.get(`http://localhost:3000/company/${idCompany}/server/${idServer}/get`)
    .then(response => {
      setServer(response.data.server);
      setCompany(response.data.company);
    });
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDomain(event.target.value);
  };
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setWhoisData(null);

    try {
      const response: AxiosResponse<WhoisData> = await axios.get(`http://localhost:3000/?domain=${domain}`); // Замените URL, если необходимо
      setWhoisData(response.data);
      console.log(response.data);
    } catch (e: any) {
      setError(e.message || 'An error occurred');
    }
  };

  const url = [`/company/${company?.idCompany}/`];
  const crumb = [`${server?.hostname}`];


  return (
    <div className="App font-montserrat grid grid-cols-[300px_auto]">
      <ModalBlock/>
      <div className='flex flex-col gap-[3.5%] m-[2%]'>
          <InfoBlock page={company?.name} url={url} crumb={crumb} />

          <div className='flex w-auto h-auto p-[1.5%] bg-white rounded-[5px] text-[16px] font-montserrat shadow-xl'>
            <div className='flex flex-col gap-[10px] text-left text-[14px]'>
              <span>Ip адрес: {server?.ipAddress ?? ' Загрузка...'}</span>
              <span>Имя хоста: {server?.hostname ?? ' Загрузка...'}</span>
              <span>Местонахождение: {server?.location ?? ' Загрузка...'}</span>
              <span>Операц. система: {server?.os ?? ' Загрузка...'}</span>
            </div>
          </div>

          {/* <div className='flex flex-col gap-5 m-[2%] text-left'>
            <form className='flex gap-5' onSubmit={handleSubmit}>
              <label htmlFor="domain">Enter Domain:</label>
              <input
                type="text"
                id="domain"
                value={domain}
                onChange={handleInputChange}
                placeholder="example.com"
              />
              <button type="submit">Get Whois Data</button>
            </form>
            
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}

            {whoisData && (
              <div className='flex flex-col gap-[5px]'>
                <h2>Whois Data for {whoisData.domainName}</h2>
                <p>Creation Date: {whoisData.creationDate || 'N/A'}</p>
                <p>Updating Date: {whoisData.updatingDate || 'N/A'}</p>
                <p>Expiration Date: {whoisData.expiresDate || 'N/A'}</p>
                <p>Registrar: {whoisData.registrarName || 'N/A'}</p>
                <p>Owner: {whoisData.ownerName || 'N/A'}</p>
              </div>
            )}
          </div> */}
          
        <div className='grid grid-cols-3 gap-[2%] w-auto h-auto'>
            {/* <AppCard /> */}
          <CreateServerButton />
        </div>
      </div>
    </div>
  );
}
export default ServerInfo;
