import React from 'react';
import { Activity, Target, Zap, ShieldAlert } from 'lucide-react';

const MetricsPanel = ({ metrics, loading }) => {
  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <p className="accent-glow" style={{ color: '#00ffcc' }}>Calibrating Quantum Models...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="glass-panel" style={{ padding: '20px', height: '100%' }}>
        <h3>Model Metrics</h3>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Select a ticker to view AI performance metrics.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Zap size={20} color="#00ffcc" /> 
        XGBoost Performance: <span className="text-gradient">{metrics.ticker}</span>
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flex: 1 }}>
        <MetricCard 
          icon={<Target size={24} color="#0088ff" />}
          title="Predictive Accuracy" 
          value={`${(metrics.accuracy * 100).toFixed(2)}%`}
          desc="Overall correctness of up/down predictions."
        />
        <MetricCard 
          icon={<Activity size={24} color="#00ffcc" />}
          title="Buy Signal Precision" 
          value={`${(metrics.precision * 100).toFixed(2)}%`}
          desc="When AI says BUY, how often is it right?"
        />
      </div>

      <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255, 51, 102, 0.1)', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <ShieldAlert size={24} color="#ff3366" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          <strong>Risk Warning:</strong> The provided accuracy is based on historical backtesting using XGBoost classification. 
          Real-world accuracy may vary. 100% "clear accuracy" is a theoretical impossibility in chaotic markets.
        </p>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, title, value, desc }) => (
  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
      {icon}
      <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>{title}</h4>
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '12px 0', textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>
      {value}
    </div>
    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{desc}</p>
  </div>
);

export default MetricsPanel;
