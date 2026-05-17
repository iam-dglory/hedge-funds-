import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Briefcase, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const PortfolioView = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [portRes, posRes] = await Promise.all([
        axios.get(`${API_BASE}/portfolio`),
        axios.get(`${API_BASE}/positions`)
      ]);
      
      if (portRes.data.error) {
        setError(portRes.data.error);
      } else {
        setPortfolio(portRes.data);
      }

      if (posRes.data.error) {
        if (!error) setError(posRes.data.error);
      } else {
        setPositions(posRes.data);
      }
    } catch (err) {
      setError("Failed to connect to backend execution engine.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCcw className="animate-spin text-teal-400 w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
          <h3 className="text-red-400 font-medium mb-2">Connection Error</h3>
          <p className="text-gray-400 text-sm">{error}</p>
          <p className="text-gray-500 text-xs mt-4">Did you configure ALPACA_API_KEY in the backend .env file?</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-teal-400" />
          Live Paper Portfolio
        </h2>
        <button onClick={fetchData} className="p-2 hover:bg-slate-800 rounded-md transition-colors">
          <RefreshCcw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="text-sm text-gray-400 mb-1 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Total Equity
          </div>
          <div className="text-3xl font-bold font-mono">
            ${parseFloat(portfolio?.equity || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
          </div>
        </div>
        
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="text-sm text-gray-400 mb-1">Buying Power</div>
          <div className="text-3xl font-bold font-mono text-gray-300">
            ${parseFloat(portfolio?.buying_power || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Open Positions</h3>
        {positions.length === 0 ? (
          <div className="text-center p-8 bg-slate-800/30 rounded-lg border border-slate-700/50 border-dashed">
            <p className="text-gray-400">No open positions.</p>
            <p className="text-xs text-gray-500 mt-2">Run the ML strategy to execute trades.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-sm text-gray-400">
                  <th className="pb-3 font-medium">Asset</th>
                  <th className="pb-3 font-medium">Qty</th>
                  <th className="pb-3 font-medium">Current Price</th>
                  <th className="pb-3 font-medium">Market Value</th>
                  <th className="pb-3 font-medium text-right">Unrealized P&L</th>
                </tr>
              </thead>
              <tbody className="text-sm font-mono">
                {positions.map((pos) => {
                  const pnl = parseFloat(pos.unrealized_pl);
                  const isPositive = pnl >= 0;
                  return (
                    <tr key={pos.symbol} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="py-4 font-bold text-teal-400">{pos.symbol}</td>
                      <td className="py-4">{pos.qty}</td>
                      <td className="py-4">${parseFloat(pos.current_price).toFixed(2)}</td>
                      <td className="py-4">${parseFloat(pos.market_value).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className={`py-4 text-right flex items-center justify-end gap-1 ${isPositive ? 'text-teal-400' : 'text-red-400'}`}>
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        ${Math.abs(pnl).toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioView;
