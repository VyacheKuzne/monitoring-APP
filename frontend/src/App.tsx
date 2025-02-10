// src/App.tsx
import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';

interface WhoisData {
  domainName?: string;
  registrar?: string;
  creationDate?: string;
  expirationDate?: string;
  raw?: string;
}

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