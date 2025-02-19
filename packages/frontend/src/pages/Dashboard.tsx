import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import ModalBlock from '../block/ModalBlock'
import InfoBlock from '../block/InfoBlock'
import ServerFilter from '../component/Card/ServerFilter'

function Dashboard() {

  return (
    <div className="App font-montserrat grid grid-cols-[300px_auto]">
      <ModalBlock/>
      <div className='flex flex-col gap-[3.5%] m-[2%]'>
        <InfoBlock page="Главная" />
        <ServerFilter/>
      </div>
    </div>
  );
}
export default Dashboard;
