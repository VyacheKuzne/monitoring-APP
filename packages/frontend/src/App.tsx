// src/App.tsx
import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { ModalProvider } from './component/ModalBlock/ModalContext';
import Dashboard from "./pages/Dashboard";
import CompanyInfo from "./pages/CompanyInfo";
import ServerInfo from "./pages/ServerInfo";
import AppInfo from "./pages/AppInfo";
import TestPageHistory from "./pages/TestPageHistory";

// // src/App.tsx
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// function App() {

//   useEffect(() => {
//     getData();
//   }, []);

//   const [companyData, setCompanyData] = useState('');

//   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setCompanyData(event.target.value);
//   };

//   const createCompany = async (event: React.FormEvent) => {
//     event.preventDefault();

//     axios.post('http://localhost:3000/company/create', {
//       name: companyData
//     }).then(response =>
//     {
//       console.log('Компания создана:', response.data);
//       getData();
//     });
//   };

//   interface Company {
//     idCompany: number;
//     name: string;
//   }

//   const [companies, setCompanies] = useState<Company[]>([]);

//   const getData = async () => {
//     axios.get('http://localhost:3000/company/get').then(response =>
//     {
//       console.log('Данные получены:', response.data);
//       setCompanies(response.data);
//     });
//   };

//   const updateData = async (idCompany: number) => {
//     axios.patch(`http://localhost:3000/company/edit/${idCompany}`, {
//       name: companyData
//     }).then(response =>
//     {
//       console.log('Данные обновлены:', response.data);
//       getData();
//     })
//     .catch(error => {
//         if (error.response) {
//           // Сервер ответил с ошибкой
//           console.error('Ответ от сервера с ошибкой:', error.response.data);
//           console.error('Статус ответа:', error.response.status);
//           console.error('Заголовки ответа:', error.response.headers);
//         } else if (error.request) {
//           // Запрос был отправлен, но ответа не получено
//           console.error('Запрос был отправлен, но ответа не получено:', error.request);
//         } else {
//           // Ошибка настройки запроса
//           console.error('Ошибка в настройке запроса:', error.message);
//         }
//         console.error('Полная ошибка:', error.config);
//       });
//   };

//   return (
//     <div>
//       <form onSubmit={createCompany}>
//         <input
//           className='w-[350px] border-2'
//           type="text"
//           placeholder="Название компании"
//           value={companyData}
//           onChange={handleChange}
//         />
//         <button type="submit">Внести данные инпута</button>
//       </form>
//       <div>
//         <button onClick={getData}>Обновить данные</button>
//         <table className='border-2'>
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Название</th>
//               <th>Действия</th>
//             </tr>
//           </thead>
//           <tbody>
//           {companies.map((company, index) => (
//             <tr  className='border-2' key={index}>
//               <td>{company.idCompany}</td> {/* Используем idCompany */}
//               <td>{company.name}</td> {/* Используем name */}
//               <td>

//                 <button type="submit" onClick={() => updateData(company.idCompany)}>Изменить</button>
//               </td>
//               <td><button>Удалить</button></td>
//             </tr>
//           ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default App;

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
