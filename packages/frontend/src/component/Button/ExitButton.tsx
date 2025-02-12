import React from 'react'
import ExitSvg from '../../img/exit.svg'
export default function NotificationButton() {
  return (
    <>
    <button className='flex items-center mx-[5%]'>
        <img src={ExitSvg} alt="Кнопка выхода" />
        <p className='mx-[10%]'>Выйти</p>
    </button>
    </>
  )
}
