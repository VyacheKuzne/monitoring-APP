import React, { useState } from "react";
import axios from "axios";

const WhoisLookup = () => {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleLookup = async () => {
    try {
      const response = await axios.get(
        `http://89.104.65.22:3000/whois/lookup?domain=${domain}`,
      );
      if (response.data.error) {
        setError(response.data.error);
        setResult("");
      } else {
        setResult(response.data.data);
        setError("");
      }
    } catch (err) {
      setError("Failed to fetch WHOIS data");
      setResult("");
    }
  };

  return (
    <div>
      <h1>WHOIS Lookup</h1>
      <input
        type="text"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        placeholder="Enter domain"
      />
      <button onClick={handleLookup}>Lookup</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && (
        <pre>
          <code>{result}</code>
        </pre>
      )}
    </div>
  );
};

export default WhoisLookup;
