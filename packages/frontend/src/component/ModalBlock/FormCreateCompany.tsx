import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PlusSvg from '../../img/Plus.svg'
import ModalWindow from './ModalWindow'
import { ModalBlockProps } from '../../interfaces/modalblockprops'
import { Company } from '../../interfaces/company';

const FormCreateCompany:React.FC<ModalBlockProps> = ({ closeForm }) => {

  const [companyData, setCompanyData] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyData(event.target.value);
  };

  const createCompany = async (event: React.FormEvent) => {
    event.preventDefault();
      axios.post('http://localhost:3000/company/create', {
        name: companyData
      }).then(response => {
        window.location.href = 'https://localhost:3001';
      });
  };

  return (
    <>
    <ModalWindow closeForm={closeForm}>
      <form className='flex flex-col' onSubmit={createCompany}>
        <span className='text-left text-[14px] mb-[5px]'>Название компании</span>
        <input 
          className='bg-gray-200 rounded-2xl text-[12px] p-[10px] pr-[30px] placeholder:text-[12px]' 
          type="text" 
          placeholder='Введите название компании'
          value={companyData} 
          onChange={handleChange}
        />
        <button type="submit">Создать</button>
      </form>
    </ModalWindow>
    </>
  )
}
export default FormCreateCompany;
