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
  }, []);

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
    </div>
  );
}

export default App;