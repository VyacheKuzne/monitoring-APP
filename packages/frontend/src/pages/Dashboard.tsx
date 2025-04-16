import React, { useState, useEffect } from "react";
import { Helmet } from 'react-helmet-async';
import axios from "axios";
import "../App.css";
import ModalBlock from "../block/ModalBlock";
import InfoBlock from "../block/InfoBlock";
import ServerFilter from "../component/Card/ServerFilter";

function Dashboard() {
  return (
    <div className="App font-montserrat grid grid-cols-[300px_auto]">
      <Helmet>
        <title>Главная страница</title>
        <meta name="robots" content="index, follow" />
      </Helmet>
      <ModalBlock />
      <div className="flex flex-col sm:gap-[3.5vh] m-[2%]">
        <InfoBlock crumb={["Главная"]} />
        <ServerFilter />
      </div>
    </div>
  );
}
export default Dashboard;
