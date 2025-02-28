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

const ModalBlock: React.FC = () => {

useEffect(() => {
    getInfo();
}, []);

const [companies, setCompanies] = useState<Company[]>([]);
const [notificationsData, setNotificationsData] = useState<Notification[]>([]);
const [modal, setModal] = useState<boolean>(false);
const [notification, setNotification] = useState<boolean>(false);

const getInfo = async () => {
    axios.get('http://localhost:3000/companies/get')
    .then(response => 
    {
        setCompanies(response.data);
    });
    axios.get('http://localhost:3000/notifications/get')
    .then(response => 
    {
        setNotificationsData(response.data)
        console.log(response.data);
    });
}

const mainText = [
    'Главная'
]
  return (
    <>
    {
        modal ? <FormCreateCompany closeForm={() => setModal(false)}/> : null
    }
    {
        notification ? <Notifications notificationData={notificationsData} /> : null
    }
    <div className='bg-white w-full h-screen p-[10%] shadow-xl flex flex-col justify-between'>
        <div>
            <div className='flex justify-between'>
                <NotificationButton  closeForm={() => setNotification(!notification)}/>
                <ExitButton/>
            </div>
            <hr className='my-[5%] h-[2px] bg-slate-600'/>
            <div className='flex-col text-left '>
                {mainText.map((text, index)=>(
                    <div key={index} className='py-[5%] flex'>
                        <div className='w-[5px] rounded-md bg-green-500 mx-[9px]' content=''></div>
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
    </>
  )
}
export default ModalBlock;