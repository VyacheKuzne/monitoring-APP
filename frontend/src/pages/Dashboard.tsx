import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import ModalBlock from '../block/ModalBlock'
import InfoBlock from '../block/InfoBlock'

function Dashboard() {

  return (
    <div className="App font-montserrat grid grid-cols-[300px_84%]">
      <ModalBlock/>
      <InfoBlock page="Главная" />
    </div>
  );
}
export default Dashboard;
