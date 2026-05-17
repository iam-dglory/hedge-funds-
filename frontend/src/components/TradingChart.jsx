import React, { useEffect, useRef } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';

const TradingChart = ({ data, signals, ticker }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (!data || data.length === 0) return; // Add guard clause here
    
    // Clear previous chart if it exists
    chartContainerRef.current.innerHTML = '';

    let chart;
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    try {
      chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: 'solid', color: 'transparent' },
          textColor: 'rgba(255, 255, 255, 0.9)',
        },
        grid: {
          vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
          horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        rightPriceScale: {
          borderColor: 'rgba(197, 203, 206, 0.8)',
        },
        timeScale: {
          borderColor: 'rgba(197, 203, 206, 0.8)',
        },
        width: chartContainerRef.current.clientWidth,
        height: 400,
      });

      chartRef.current = chart;

      // Create Candlestick Series
      const mainSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      if (data && data.length > 0) {
        // Ensure data is sorted by time and has no duplicates
        const uniqueDataMap = new Map();
        data.forEach(item => uniqueDataMap.set(item.time, item));
        const sortedUniqueData = Array.from(uniqueDataMap.values()).sort((a, b) => new Date(a.time) - new Date(b.time));
        mainSeries.setData(sortedUniqueData);
      }

      // Set markers for AI Signals
      if (signals && signals.length > 0) {
        // Filter out signals whose time doesn't exist in data, as lightweight charts requires marker time to be in series data
        const dataTimes = new Set(data.map(d => d.time));
        
        const uniqueSignalMap = new Map();
        signals.forEach(item => {
           if (dataTimes.has(item.time)) {
               uniqueSignalMap.set(item.time, item);
           }
        });
        const sortedUniqueSignals = Array.from(uniqueSignalMap.values()).sort((a, b) => new Date(a.time) - new Date(b.time));
        
        mainSeries.setMarkers(sortedUniqueSignals);
      }

      window.addEventListener('resize', handleResize);
    } catch (err) {
      console.error("Lightweight Charts Error:", err);
      chartContainerRef.current.innerHTML = `<div style="color: red; padding: 20px;">Chart Rendering Error: ${err.message}</div>`;
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chart) chart.remove();
    };
  }, [data, signals, ticker]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <h3 style={{ position: 'absolute', top: 10, left: 20, zIndex: 10, margin: 0, opacity: 0.8 }}>
        {ticker} - AI Predicted Signals
      </h3>
      <div
        ref={chartContainerRef}
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
      />
    </div>
  );
};

export default TradingChart;
