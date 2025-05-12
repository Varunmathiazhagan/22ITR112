import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [numberType, setNumberType] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const numberTypes = [
    { id: 'p', label: 'Prime' },
    { id: 'f', label: 'Fibonacci' },
    { id: 'e', label: 'Even' },
    { id: 'r', label: 'Random' },
  ];

  const fetchNumbers = async () => {
    if (!numberType) {
      setErrorMsg('Please select a number type.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await axios.get(`http://localhost:9876/numbers/${numberType}`);
      setResult(res.data);
      if (res.data.error) {
        setErrorMsg(res.data.error);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setErrorMsg('Failed to fetch numbers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>Sliding Window Average Calculator</h1>

      <div className="button-group">
        {numberTypes.map((type) => (
          <button
            key={type.id}
            className={`type-button ${numberType === type.id ? 'active' : ''}`}
            onClick={() => setNumberType(type.id)}
            disabled={loading}
          >
            {type.label}
          </button>
        ))}
        <button
          className="fetch-button"
          onClick={fetchNumbers}
          disabled={loading}
        >
          {loading ? <span className="spinner"></span> : 'Fetch Numbers'}
        </button>
      </div>

      {!numberType && !result && !errorMsg && (
        <div className="info-msg">
          Select a number type to fetch and calculate the sliding window average.
        </div>
      )}

      {errorMsg && <div className="error-msg">⚠️ {errorMsg}</div>}

      {result && !errorMsg && (
        <div className="result-box">
          <h2>Response</h2>
          <p><strong>Previous State:</strong> {JSON.stringify(result.windowPrevState)}</p>
          <p><strong>Current State:</strong> {JSON.stringify(result.windowCurrState)}</p>
          <p><strong>New Numbers:</strong> {JSON.stringify(result.numbers)}</p>
          <p><strong>Average:</strong> {result.avg.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}

export default App;