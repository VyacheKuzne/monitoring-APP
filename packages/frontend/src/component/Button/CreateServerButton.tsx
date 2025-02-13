import React, { useState, useEffect } from 'react';
import PlusSvg from '../../img/Plus.svg'

function ServerCard() {

  return (
    <button className="flex items-center justify-center gap-[15px] max-w-[400px] min-h-[200px] p-[30px] bg-white hover:bg-slate-200 rounded-[5px] text-[16px] font-montserrat shadow-xl transition">
        <img className='w-[25px]' src={PlusSvg} alt="Добавить новый сервер" />
        <span>Добавить новый сервер</span>
    </button>
  );
}
export default ServerCard;
