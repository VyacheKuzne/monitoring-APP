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

// src/App.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {  

  // interface DomainInfo {
  //   domainName: string;
  //   creationDate: string;
  //   expiresDate: string;
  //   daysToExpire: number;
  // }

  const [domainData, setDomainData] = useState('');
  // const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDomainData(event.target.value);
  };

  const getDomainInfo = async (event: React.FormEvent) => {
    event.preventDefault();

    axios.get(`http://localhost:3000/whois/${domainData}`)
    .then(response => 
    {
      console.log('Информация о домене получена и добавлена в базу:', response.data);
      // setDomainInfo(response.data);
    });
  };

  return (
    <div>
      <form onSubmit={getDomainInfo}>
        <input 
          className='w-[350px] border-2' 
          type="text" 
          placeholder="Домен 'example.com'" 
          value={domainData} 
          onChange={handleChange}
        />
        <button type="submit">Получить данные по домену</button>
      </form>
      <div>
        {/* <p>{domainInfo.domainName}</p>
        <p>{domainInfo.creationDate}</p>
        <p>{domainInfo.expiresDate}</p>
        <p>{domainInfo.daysToExpire}</p> */}
      </div>
    </div>
  );
}

export default App;