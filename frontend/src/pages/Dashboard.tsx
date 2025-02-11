import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import ModalBlock from '../block/ModalBlock'
import InfoBlock from '../block/InfoBlock'
import { Company } from '../interfaces/company';

function Dashboard() {

  return (
    <div className="App font-montserrat grid grid-cols-[300px_84%]">
        {/* {companies.map((company, index) =>(
            <div>
                <p>{company.idCompany}</p>
                <p>{company.name}</p>
            </div>
        
        ))} */}
      <ModalBlock/>
      <InfoBlock/>
    </div>
  );
}
export default Dashboard;
