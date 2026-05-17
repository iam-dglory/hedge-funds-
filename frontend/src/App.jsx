import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, TrendingUp, Activity, AlertTriangle, Play } from 'lucide-react';
import TradingChart from './components/TradingChart';
import MetricsPanel from './components/MetricsPanel';
import PortfolioView from './components/PortfolioView';

const API_BASE = 'http://localhost:8000/api';

function App() {
  const [ticker, setTicker] = useState('AAPL');
  const [searchInput, setSearchInput] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'portfolio'
  const [executing, setExecuting] = useState(false);

  const fetchStockData = async (symbol) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/data/${symbol}`);
      setData(response.data);
      setTicker(symbol.toUpperCase());
      setViewMode('chart');
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData('AAPL');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchStockData(searchInput);
      setSearchInput('');
    }
  };

  const handleExecute = async () => {
    if (!ticker) return;
    setExecuting(true);
    try {
      const response = await axios.post(`${API_BASE}/execute/${ticker}?qty=10`);
      const { execution } = response.data;
      if (execution.error) {
        alert(`Execution Error: ${execution.error}`);
      } else if (execution.status === 'skipped') {
        alert(execution.message);
      } else {
        alert(`Trade Executed! Action: ${execution.action} | Symbol: ${execution.symbol}`);
        setViewMode('portfolio'); // Switch to portfolio to see it
      }
    } catch (err) {
      alert(`Failed to execute: ${err.response?.data?.detail || err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  const popularAssets = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'SPY'];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-teal-400 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Nexus Quant
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Hedge System V2</p>
        </div>

        <div className="px-4 mb-6">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Enter Ticker (e.g. MSFT)"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-teal-500 transition-colors"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <div className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Views</div>
          <button 
            onClick={() => setViewMode('chart')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${viewMode === 'chart' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Activity className="w-4 h-4" /> ML Dashboard
          </button>
          <button 
            onClick={() => setViewMode('portfolio')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-6 transition-colors ${viewMode === 'portfolio' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <TrendingUp className="w-4 h-4" /> Live Portfolio
          </button>

          <div className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Popular Assets</div>
          <div className="space-y-1">
            {popularAssets.map(asset => (
              <button
                key={asset}
                onClick={() => fetchStockData(asset)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${ticker === asset && viewMode === 'chart' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <Activity className="w-4 h-4" />
                {asset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative bg-slate-900/50">
        
        {/* Top Header Bar */}
        <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
             <h2 className="text-lg font-medium">{viewMode === 'chart' ? `${ticker} Analysis` : 'Paper Trading Account'}</h2>
             {loading && <span className="text-teal-400 text-sm animate-pulse">Running ML Pipeline...</span>}
          </div>
          
          {viewMode === 'chart' && data && !error && (
            <button 
              onClick={handleExecute}
              disabled={executing}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${executing ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-teal-500 text-slate-900 hover:bg-teal-400'}`}
            >
              <Play className="w-4 h-4 fill-current" />
              {executing ? 'Executing...' : `Live Execute ${ticker}`}
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
               <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
               <p className="text-lg">{error}</p>
            </div>
          ) : viewMode === 'portfolio' ? (
            <PortfolioView />
          ) : data ? (
            <>
              {/* Chart Section */}
              <div className="glass-panel p-1 border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl relative">
                <TradingChart 
                  data={data.chart_data} 
                  signals={data.signals} 
                  ticker={ticker} 
                />
              </div>

              {/* Metrics Panel */}
              <MetricsPanel 
                metrics={data.metrics} 
                ticker={ticker} 
              />
            </>
          ) : null}
        </div>
        
      </div>
    </div>
  );
}

export default App;
