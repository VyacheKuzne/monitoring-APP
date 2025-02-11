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
import axios, { AxiosResponse } from 'axios';

function App() {
  const [domain, setDomain] = useState('');
  const [whoisData, setWhoisData] = useState<WhoisData | null>(null);
  const [error, setError] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDomain(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setWhoisData(null);

    try {
      const response: AxiosResponse<WhoisData> = await axios.get(`http://localhost:3000/?domain=${domain}`); // Замените URL, если необходимо
      setWhoisData(response.data);
    } catch (e: any) {
      setError(e.message || 'An error occurred');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="domain">Enter Domain:</label>
        <input
          type="text"
          id="domain"
          value={domain}
          onChange={handleInputChange}
          placeholder="example.com"
        />
        <button type="submit">Get Whois Data</button>
      </form>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {whoisData && (
        <div>
          <h2>Whois Data for {whoisData.domainName}</h2>
          <p>Registrar: {whoisData.registrar || 'N/A'}</p>
          <p>Creation Date: {whoisData.creationDate || 'N/A'}</p>
          <p>Expiration Date: {whoisData.expirationDate || 'N/A'}</p>
          <p>Raw Data: {whoisData.raw || 'N/A'}</p>
        </div>
      )}
    </div>
  );
}

export default App;