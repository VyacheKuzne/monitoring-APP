import React from 'react'
import NotificationButton from '../component/Button/NotificationButton'
import ExitButton from '../component/Button/ExitButton'
import CreateCompanyButton from '../component/Button/CreateCompanyButton'
import ClientButton from '../component/Button/ClientButton'

export default function ModalBlock() {
const mainText = [
    'Главная',
    
]
  return (
    <>
    <div className='bg-white w-full h-[950px] p-[10%] shadow-xl flex flex-col justify-between'>
        <div>
            <div className='flex justify-between'>
                <NotificationButton/>
                <ExitButton/>
            </div>
                <hr className='my-[5%] h-[2px] bg-slate-600'/>
            <div className='flex-col text-left '>
                {
                    mainText.map((text, index)=>(
                        <div key={index} className='py-[5%] flex'>
                            <div className='w-[5px] rounded-md bg-green-500' content=''></div> <p className=' px-[5%]'>{text}</p>
                        </div>
                    ))
                }
            </div>
            <div>
                <ClientButton/>
            </div>
        </div>
        <div>
            <CreateCompanyButton/>
        </div>
    </div>
    </>
  )
}
