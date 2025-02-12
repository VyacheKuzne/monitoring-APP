import React from 'react';
import SearchSvg from '../../img/SearchSvg.svg';

export default function ServerCard() {
    return (
        <>
            <div className='w-1/4 mx-[2%] bg-white rounded-md text-left p-[1.5%] shadow-lg'>
                <p className='text8-16px'>Статус работы серверов</p>
                <div className='h-[1px] bg-gray-500 my-[2%]' content=''></div>
                <div className='h-[35px]'>
                    <div className='flex content-center  relative w-auto h-full'>
                        <input
                            type="text"
                            className='bg-gray-200 rounded-2xl text6-12px w-3/4 p-[2%] pr-[3em]' /* pr - padding right */
                            placeholder='        Найти сервер'
                        />
                        <div
                            className='absolute top-1/2 left-[0.5em] transform -translate-y-1/2' /* top-1/2, left, выравнивание по центру по вертикали, левый отступ */
                        >
                            <img
                                src={SearchSvg}
                                alt="Кнопка поиска"
                                className='h-[1.2em] w-[1.2em]' /* устанавливаем высоту и ширину картинки в em*/
                            />
                        </div>
                        <div className='flex h-full items-center justify-around w-1/5'>
                            <button content=''className='bg-white border-4 border-red-500 h-[20px] w-[20px] rounded-full'/>
                            <button content=''className='bg-white border-4 border-green-500 h-[20px] w-[20px] rounded-full'/>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}