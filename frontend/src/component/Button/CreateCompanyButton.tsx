import React from 'react'
import PlusSvg from '../../img/Plus.svg'
export default function CreateCompanyButton() {
  return (
    <>
    <button className='w-full flex'>
        <img src={PlusSvg} alt="Создать новую компанию"/>
        <p className='mx-[5%]'>Добавить компанию</p>
    </button>
    </>
  )
}
