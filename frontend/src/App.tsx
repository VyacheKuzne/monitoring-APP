// src/App.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface WhoisData {
  domainName?: string;
  registrar?: string;
  creationDate?: string;
  expirationDate?: string;
  raw?: string;
}

function App() {
  const [domain, setDomain] = useState<string>('');
  const [whoisData, setWhoisData] = useState<WhoisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchRandomDomain = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<{ domain: string }>('/domains/random'); // Adjust URL to your NestJS server address
      setDomain(response.data.domain);
      setWhoisData(null); // Clear previous data
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch random domain.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWhoisData = async () => {
    setLoading(true);
    setError(null);
    setWhoisData(null); // Clear previous data
    try {
      const response = await axios.get<WhoisData>(`/domains/${domain}/whois`); // Adjust URL
      setWhoisData(response.data);
    } catch (err: any) {
      console.error(err);
      setError(`Failed to fetch Whois data for ${domain}.  ${err?.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchRandomDomain(); // Fetch a random domain on initial load
    getData();
  }, []);
  
  const [companyData, setCompanyData] = useState('');

  // let companyData = 'ООО "Название компании"'
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyData(event.target.value);
  };

  const createCompany = async (event: React.FormEvent) => {
    event.preventDefault();

    axios.post('http://localhost:3000/company/create', {
      name: companyData
    }).then(response => 
    {
      console.log('Компания создана:', response.data);
    });
  };

  interface Company {
    idCompany: number;
    name: string;
  }

  const [companies, setCompanies] = useState<Company[]>([]);

  const getData = async () => {
    axios.get('http://localhost:3000/company/get').then(response => 
    {
      console.log('Данные получены:', response.data);
      setCompanies(response.data);
    });
  };

  return (
    <div>
      <h1>Whois Lookup</h1>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      {loading && <div>Loading...</div>}

      <div>
        <button onClick={fetchRandomDomain} disabled={loading}>Get Random Domain</button>
      </div>

      {domain && (
        <div>
          <h2>Domain: {domain}</h2>
          <button onClick={fetchWhoisData} disabled={loading}>Get Whois Data</button>
        </div>
      )}

      {whoisData && (
        <div>
          <h3>Whois Information:</h3>
          <pre>{whoisData.raw}</pre> {/* Display raw data */}
        </div>
      )}


      <form onSubmit={createCompany}>
        <input 
          className='w-[350px] border' 
          type="text" 
          placeholder="Название компании" 
          value={companyData} 
          onChange={handleChange}
        />
        <button type="submit">Внести данные инпута</button>
      </form>
      <div>
        <button onClick={getData}>Получить данные</button>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
            </tr>
          </thead>
          <tbody>
          {companies.map((company, index) => (
            <tr key={index}>
              <td>{company.idCompany}</td> {/* Используем idCompany */}
              <td>{company.name}</td> {/* Используем name */}
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;