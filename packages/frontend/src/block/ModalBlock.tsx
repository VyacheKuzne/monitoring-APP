import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NotificationButton from '../component/Button/NotificationButton'
import ExitButton from '../component/Button/ExitButton'
import CreateCompanyButton from '../component/Button/CreateCompanyButton'
import ClientButton from '../component/Button/ClientButton'
import { Company } from '../interfaces/company';
import FormCreateCompany from '../component/ModalBlock/FormCreateCompany';

const ModalBlock: React.FC = () => {

useEffect(() => {
    getCompanies();
}, []);

const [companies, setCompanies] = useState<Company[]>([]);
const [modal, setModal] = useState<boolean>(false);

const getCompanies = async () => {
    axios.get('http://localhost:3000/companies/get')
    .then(response => 
    {
        setCompanies(response.data);
    });
}    

const FormCompany = (modalAction: boolean) => {
    setModal(modalAction);
}


const mainText = [
    'Главная',
]
  return (
    <>
    {
        modal ? <FormCreateCompany closeForm={FormCompany}/> : null
    }

    <div className='bg-white w-full h-screen p-[10%] shadow-xl flex flex-col justify-between'>
        <div>
            <div className='flex justify-between'>
                <NotificationButton/>
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
            <CreateCompanyButton openForm={FormCompany} />

    </div>
    </>
  )
}
export default ModalBlock;