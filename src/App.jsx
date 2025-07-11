// Import React and hooks
import React, { useEffect, useState } from "react";
// Import Chart.js and react-chartjs-2 for chart rendering
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";

// Register Chart.js components for use with react-chartjs-2
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale
);

// Timeframe options for the selector
const TIMEFRAMES = [
  { label: "1d", value: 1 },
  { label: "7d", value: 7 },
  { label: "14d", value: 14 },
  { label: "30d", value: 30 },
  { label: "6mo", value: 180 },
  { label: "1yr", value: 365 },
];

function App() {
  // State for selected timeframe
  const [timeframe, setTimeframe] = useState(7);
  // State for price history data (for the chart)
  const [priceHistory, setPriceHistory] = useState([]);
  // State for loading spinner for chart fetch
  const [loading, setLoading] = useState(true);
  // State for current price, 24h high/low, and ATH
  const [currentPrice, setCurrentPrice] = useState(null);
  const [prevPrice, setPrevPrice] = useState(null); // for animation
  const [high24h, setHigh24h] = useState(null);
  const [low24h, setLow24h] = useState(null);
  const [ath, setAth] = useState(null);
  const [athDate, setAthDate] = useState(null);
  // State for loading spinner for price fetch
  const [priceLoading, setPriceLoading] = useState(true);
  const [error, setError] = useState(null); // error state for fetch failures

  // Dark mode toggle effect
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Fetch current price, 24h high/low, and ATH from CoinGecko
  useEffect(() => {
    let interval;
    let abortController;
    const fetchCurrent = async () => {
      setPriceLoading(true);
      setError(null);
      abortController = new AbortController();
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/bittensor?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false",
          { signal: abortController.signal }
        );
        if (!res.ok) throw new Error('Failed to fetch price data');
        const data = await res.json();
        setPrevPrice(currentPrice); // for animation
        setCurrentPrice(data.market_data.current_price.usd);
        setHigh24h(data.market_data.high_24h.usd);
        setLow24h(data.market_data.low_24h.usd);
        setAth(data.market_data.ath.usd);
        setAthDate(data.market_data.ath_date.usd);
      } catch (e) {
        if (e.name !== 'AbortError') {
          setError('Failed to fetch price data. Please try again later.');
          setCurrentPrice(null);
          setHigh24h(null);
          setLow24h(null);
          setAth(null);
          setAthDate(null);
        }
      } finally {
        setPriceLoading(false);
      }
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchCurrent();
        interval = setInterval(fetchCurrent, 30000); // 30 seconds
      } else {
        clearInterval(interval);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    handleVisibility();
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (abortController) abortController.abort();
    };
    // eslint-disable-next-line
  }, []);

  // Fetch price history for $TAO from CoinGecko for the selected timeframe
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/bittensor/market_chart?vs_currency=usd&days=${timeframe}`
      );
      const data = await res.json();
      setPriceHistory(data.prices);
      setLoading(false);
    };
    fetchHistory();
  }, [timeframe]);

  // Prepare data and options for the Chart.js line chart
  const chartData = {
    labels: priceHistory.map(([timestamp]) => {
      const date = new Date(timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: "$TAO Price (USD)",
        data: priceHistory.map(([, price]) => price),
        fill: true,
        borderColor: "#ef4444", // red-500
        backgroundColor: "rgba(239,68,68,0.15)", // transparent red
        pointRadius: 0,
        tension: 0.3, // smooth line
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "#18181b",
        titleColor: "#fff",
        bodyColor: "#e4e4e7",
        borderColor: "#a1a1aa",
        borderWidth: 1,
        titleFont: { family: 'Inter, system-ui, sans-serif', weight: 'bold', size: 14 },
        bodyFont: { family: 'Inter, system-ui, sans-serif', weight: 'normal', size: 13 },
        padding: 12,
        caretSize: 6,
        cornerRadius: 6,
      },
    },
    scales: {
      x: {
        display: true,
        grid: { color: "rgba(255,255,255,0.08)" },
        ticks: { color: "#a1a1aa", font: { family: 'Inter, system-ui, sans-serif', weight: 'normal', size: 12 } },
      },
      y: {
        display: true,
        grid: { color: "rgba(255,255,255,0.08)" },
        ticks: { color: "#a1a1aa", font: { family: 'Inter, system-ui, sans-serif', weight: 'normal', size: 12 } },
      },
    },
  };

  // Format ATH date for display
  const formatAthDate = (dateString) => {<q></q>
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Price animation: fade on change
  const priceFadeClass =
    prevPrice !== null && currentPrice !== prevPrice
      ? "transition-colors duration-500 bg-zinc-200/30 px-2 rounded"
      : "";

  return (
    <div className="min-h-screen px-4 py-10 font-sans bg-zinc-900 text-zinc-200 transition-colors duration-300" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="max-w-4xl mx-auto bg-zinc-900 text-zinc-200 p-6 rounded-xl shadow-md border border-zinc-800 transition-colors duration-300">
        {/* App title */}
        <h1 className="text-xl font-bold text-center mb-6 tracking-tight" style={{ color: '#e4e4e7', fontWeight: 700 }}>$TAO Price Chart</h1>
        {/* Current price, 24h range */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 w-full justify-center items-center">
          {/* Current price */}
          {currentPrice !== null && !priceLoading ? (
            <div
              className="min-w-[160px] flex items-center gap-2 text-sm font-normal"
              style={{ color: '#e4e4e7', fontWeight: 400, fontSize: '0.95rem' }}
            >
              <span style={{ color: '#e4e4e7' }}>Current Price:</span>
              <span
                className={`text-base font-normal text-zinc-200 ${priceFadeClass}`}
                data-testid="current-price"
                key={currentPrice}
                style={{ color: '#e4e4e7', fontWeight: 500, fontSize: '1rem' }}
              >
                ${currentPrice.toLocaleString()}
              </span>
            </div>
          ) : null}
          {/* 24h Range */}
          {low24h !== null && high24h !== null && !priceLoading ? (
            <div
              className="min-w-[180px] text-sm font-normal"
              style={{ color: '#e4e4e7', fontWeight: 400, fontSize: '0.95rem' }}
            >
              24h Range:
              <span data-testid="range-24h" className="ml-2" style={{ color: '#e4e4e7' }}>
                <span style={{ color: '#e4e4e7' }}>${low24h.toLocaleString()}</span>
                <span className="mx-1" style={{ color: '#e4e4e7' }}>–</span>
                <span style={{ color: '#e4e4e7' }}>${high24h.toLocaleString()}</span>
              </span>
            </div>
          ) : null}
        </div>
        {/* Loading skeleton for price area */}
        {priceLoading && (
          <div className="flex flex-col sm:flex-row gap-6 mb-6 w-full justify-center items-center">
            <div className="inline-block h-6 w-32 bg-zinc-700 rounded animate-pulse" />
            <div className="inline-block h-6 w-40 bg-zinc-700 rounded animate-pulse" />
          </div>
        )}
        {/* Error message if fetch fails */}
        {error && (
          <div className="w-full text-center text-red-400 font-semibold mb-4" role="alert">
            {error}
          </div>
        )}
        {/* Timeframe selector */}
        <div className="flex gap-2 mb-8 flex-wrap justify-center">
          {TIMEFRAMES.map(({ label, value }) => {
            const isSelected = timeframe === value;
            return (
              <button
                key={value}
                className={`px-3 py-1 rounded-full text-sm font-medium border transition focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2
                  ${isSelected
                    ? "bg-zinc-800 border-red-500 text-red-400 font-bold shadow"
                    : "bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-500"}
                `}
                onClick={() => setTimeframe(value)}
                style={{ minWidth: 56 }}
              >
                {label}
              </button>
            );
          })}
        </div>
        {/* Chart section with card styling */}
        <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900 shadow-inner p-4 transition-colors duration-300 overflow-x-auto" style={{ maxWidth: '100%' }}>
          <div className="h-64 w-full min-w-[400px] flex items-center justify-center">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-full h-40 bg-zinc-700 rounded animate-pulse" />
              </div>
            ) : (
              <Line data={chartData} options={chartOptions} height={256} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
