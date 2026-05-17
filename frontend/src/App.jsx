import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TradingChart from './components/TradingChart';
import MetricsPanel from './components/MetricsPanel';
import { Search, TrendingUp, BarChart2 } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

function App() {
  const [ticker, setTicker] = useState('AAPL');
  const [searchInput, setSearchInput] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (symbol) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/api/data/${symbol}`);
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to fetch data or train model.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(ticker);
  }, [ticker]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setTicker(searchInput.toUpperCase().trim());
      setSearchInput('');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div className="glass-panel" style={{ width: '300px', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '24px', display: 'flex', flexDirection: 'column', borderRadius: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <TrendingUp size={32} color="#00ffcc" className="accent-glow" style={{ borderRadius: '50%' }} />
          <div>
            <h2 className="text-gradient" style={{ margin: 0 }}>Nexus Quant</h2>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>HEDGE SYSTEM V1</span>
          </div>
        </div>

        <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: '30px' }}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter Ticker (e.g. MSFT, TSLA)"
            style={{
              width: '100%',
              padding: '12px 16px 12px 40px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'white',
              outline: 'none',
              fontSize: '0.9rem'
            }}
          />
          <Search size={18} color="rgba(255,255,255,0.5)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
        </form>

        <h3 style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '16px', textTransform: 'uppercase' }}>Popular Assets</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {['AAPL', 'MSFT', 'NVDA', 'TSLA', 'SPY'].map(sym => (
            <button
              key={sym}
              onClick={() => setTicker(sym)}
              style={{
                padding: '12px 16px',
                background: ticker === sym ? 'rgba(0, 255, 204, 0.1)' : 'transparent',
                border: ticker === sym ? '1px solid rgba(0, 255, 204, 0.3)' : '1px solid transparent',
                borderRadius: '8px',
                color: ticker === sym ? '#00ffcc' : 'rgba(255,255,255,0.7)',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                  if(ticker !== sym) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }
              }}
              onMouseLeave={(e) => {
                  if(ticker !== sym) {
                      e.currentTarget.style.background = 'transparent';
                  }
              }}
            >
              <BarChart2 size={16} /> {sym}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
        
        {error ? (
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid #ff3366', background: 'rgba(255, 51, 102, 0.05)' }}>
             <h3 style={{ color: '#ff3366', margin: '0 0 8px 0' }}>Error Fetching Data</h3>
             <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)' }}>{error}</p>
          </div>
        ) : null}

        {/* Top row: Chart */}
        <div className="glass-panel" style={{ flex: '1 1 60%', minHeight: '450px', padding: '16px', position: 'relative' }}>
          {loading && (
             <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(13, 17, 23, 0.7)', zIndex: 50, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '12px' }}>
                <div className="accent-glow" style={{ width: '40px', height: '40px', border: '3px solid #00ffcc', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
             </div>
          )}
          <TradingChart 
             data={data?.chart_data || []} 
             signals={data?.signals || []} 
             ticker={ticker}
          />
        </div>

        {/* Bottom row: Metrics */}
        <div style={{ flex: '0 0 auto' }}>
          <MetricsPanel metrics={data?.metrics} loading={loading} />
        </div>

      </div>
    </div>
  );
}

export default App;
