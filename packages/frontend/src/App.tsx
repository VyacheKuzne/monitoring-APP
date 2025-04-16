// src/App.tsx
import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CompanyInfo from "./pages/CompanyInfo";
import ServerInfo from "./pages/ServerInfo";
import AppInfo from "./pages/AppInfo";
import TestPageHistory from "./pages/TestPageHistory";

function App() {
  return (
    <Router>
      <Routes>
        {/* <ModalProvider> */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/company/:idCompany/" element={<CompanyInfo />} />
        <Route
          path="/company/:idCompany/server/:idServer/"
          element={<ServerInfo />}
        />
        <Route
          path="/company/:idCompany/server/:idServer/app/:idApp"
          element={<AppInfo />}
        />
        <Route
          path="/company/:idCompany/server/:idServer/app/:idApp/page/:idPage"
          element={<TestPageHistory />}
        />
        {/* </ModalProvider> */}
      </Routes>
    </Router>
  );
}

export default App;
