import React, { useState } from 'react';
import ClientSvg from '../../img/ClientSvg.svg';
import { Company } from '../../interfaces/company';

interface ModalBlockProps {
    companiesData: Company[];
}

export default function ClientButton({ companiesData }: ModalBlockProps) {
    const [isOpen, setIsOpen] = useState(false); // Состояние, показывающее, открыт ли список
    const rotateAngle = isOpen ? 180 : 0;  // Угол поворота

    const handleClick = () => {
        setIsOpen(!isOpen); // Переключение состояния при клике
    };
    const clients = companiesData;
    return (
        <>
            <button
                className='flex'
                onClick={handleClick}
                style={{ transition: 'transform 0.3s ease' }}
            >
                <img
                    src={ClientSvg}
                    alt="Развернуть клиентов"
                    className='mt-[1px]'
                    style={{ transform: `rotate(${rotateAngle}deg)`, transition: 'transform 0.3s ease' }}
                />
                <p className='mx-[5%]'>
                    Клиент
                </p>
            </button>
            {isOpen && (
                <div className='my-[5%]'>
                    <ul className='text-left border-l-[3px] border-gray-500 px-[3%]'>
                        {
                            clients.map((client, index) =>(
                                <li className='px-[5%] py-[3%]' key={index}>{client.name}</li>
                            ))
                        }
                    </ul>
                </div>
            )}
        </>
    );
}