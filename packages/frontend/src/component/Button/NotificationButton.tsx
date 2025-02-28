import React from 'react'
import NotificationSvg from '../../img/notification.svg'
import { ModalBlockProps } from '../../interfaces/modalblockprops'

const NotificationButton:React.FC<{ closeForm: (value: boolean) => void }> = ({ closeForm }) => {
  return (
    <>
    <button className='z-[10]' onClick={() => closeForm(false) }>
        <img src={NotificationSvg} alt="Кнопка уведомления" />
    </button>
    </>
  )
}
export default NotificationButton