import React from 'react'
import PlusSvg from '../../img/Plus.svg'
import { ModalBlockProps } from '../../interfaces/modalblockprops'

const ModalWindow:React.FC<ModalBlockProps> = ({ closeForm, children }) => {
  return (
    <>
    <div className='absolute flex justify-center items-center'>
        <div className='absolute max-w-[80%] h-auto bg-white rounded-[15px] z-20'>
          <div className='flex justify-end p-[10px]'>
            <button className='rotate-45 select-none' onClick={() => closeForm(false)}><img src={PlusSvg} alt="Создать новую компанию" /></button>
          </div>
          <div className='px-[30px] pb-[30px]'>
              {children}
          </div>
        </div>
        <div className='w-screen h-screen bg-black opacity-50 z-10'></div>
    </div>
    </>
  )
}
export default ModalWindow
