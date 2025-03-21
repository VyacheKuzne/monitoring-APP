import React, {useEffect, useState} from 'react';
import SearchSvg from '../../img/SearchSvg.svg';
import transitArrow from '../../img/transitArrow.svg'
import axios  from 'axios';
import { Company } from '../../interfaces/company';

export default function ServerCard() {

    useEffect(() => {
        getInfo();
    }, []);

    const [servers, setServers] = useState<Company[]>([]);

    const getInfo = async () => {
        axios.get(`http://localhost:3000/companies/get`)
        .then(response => 
        {
            setServers(response.data);
            // console.log(response.data);
        });
    }

    return (
        <>
            <div className='min-w-[250px] max-w-[380px] max-h-[500px] bg-white rounded-md text-left p-[1.5%] shadow-lg'>
                <p className='text8-16px'>Статус работы серверов</p>
                <div className='h-[1px] bg-gray-500 my-[4.5%]' content=''></div>
                <div className='h-[35px]'>
                    <div className='flex content-center gap-[15px] w-auto h-full z-10'>
                        <input
                            type="text"
                            className='bg-gray-200 rounded-2xl text-[12px] w-3/4 pl-[30px] p-[2%] pr-[3em]' /* pr - padding right */
                            placeholder='Найти сервер'
                        />
                        <div
                            className='absolute top-1/2 left-[0.5em] transform -translate-y-1/2' /* top-1/2, left, выравнивание по центру по вертикали, левый отступ */
                        >
                            <img
                                src={SearchSvg}
                                alt="Кнопка поиска"
                                className='h-[1.2em] w-[1.2em] z-20' /* устанавливаем высоту и ширину картинки в em*/
                            />
                        </div>
                        <div className='flex h-full items-center gap-[10px]'>
                            <button content=''className='border-[2px] border-green-500 min-h-[17px] h-[17px] min-w-[17px] w-[17px] rounded-full'/>
                            <button content=''className='border-[2px] border-red-500 min-h-[17px] h-[17px] min-w-[17px] w-[17px] rounded-full'/>
                        </div>
                    </div>
                </div>
                <div className='mt-[4.5%]'>                        
                {servers.map((server, index) =>(
                    <a 
                        href={`/company/${server.idCompany}/`} 
                        className='flex gap-[15px] items-center mb-[4.5%]'
                        key={index}
                    >
                        <div className='min-w-[18px] w-[18px] min-h-[18px] h-[18px] bg-green-500 rounded-full' />
                        <span className='w-full text8-16px'>{server.name}</span>
                        <img src={transitArrow} alt="Перейти к серверам" />
                    </a>
                ))}
                </div>
            </div>
        </>
    );
}