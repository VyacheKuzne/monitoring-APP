import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NotificationButton from '../component/Button/NotificationButton'
import ExitButton from '../component/Button/ExitButton'
import CreateCompanyButton from '../component/Button/CreateCompanyButton'
import ClientButton from '../component/Button/ClientButton'
import { Company } from '../interfaces/company';
import { Notification } from '../interfaces/notification';
import FormCreateCompany from '../component/ModalBlock/FormCreateCompany';
import Notifications from '../component/ModalBlock/Notifications';
import { useLocation } from "react-router-dom";

const ModalBlock: React.FC = () => {

const location = useLocation();
const isDashboard = location.pathname === "/";

useEffect(() => {
    getInfo();
}, []);

const [companies, setCompanies] = useState<Company[]>([]);
const [modal, setModal] = useState<boolean>(false);
const [notification, setNotification] = useState<boolean>(false);

const getInfo = async () => {
    axios.get('http://localhost:3000/companies/get')
    .then(response => 
    {
        setCompanies(response.data);
    });
}

const mainText = [
    'Главная'
]
  return (
    <div className='pl-[300px]'>
        <div className='fixed top-0 left-0 w-[300px]'>
            {
                modal ? <FormCreateCompany closeForm={() => setModal(false)}/> : null
            }
            {
                notification ? <Notifications /> : null
            }
            <div className=' bg-white min-w-full h-screen p-[10%] shadow-xl flex flex-col justify-between'>
                <div>
                    <div className='flex justify-between'>
                        <NotificationButton  closeForm={() => setNotification(!notification)}/>
                        <ExitButton/>
                    </div>
                    <hr className='my-[5%] h-[2px] bg-slate-600'/>
                    <div className='flex-col text-left '>
                        {mainText.map((text, index)=>(
                            <div key={index} className='py-[5%] flex'>
                                <div className={`w-[5px] rounded-md mx-[9px] ${isDashboard ? 'bg-green-500' : 'bg-gray-500'}`}  content=''></div>
                                <a className=' px-[5%]' href='/'>{text}</a>
                            </div>
                        ))}
                    </div>
                    <div>
                        <ClientButton companiesData={companies} />
                    </div>
                </div>
                <CreateCompanyButton openForm={() => setModal(true)} />
            </div>
        </div>
    </div>
  )
}
export default ModalBlock;