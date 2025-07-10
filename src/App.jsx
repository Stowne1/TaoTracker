import React, { useEffect, useState } from "react";
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

function App() {
  // State for current $TAO price and 24h change
  const [taoData, setTaoData] = useState(null);
  // State for loading spinner for price fetch
  const [loading, setLoading] = useState(true);
  // State for error message if fetch fails
  const [error, setError] = useState(null);
  // State for last updated time
  const [lastUpdated, setLastUpdated] = useState(null);
  // State for 7-day price history (for chart)
  const [priceHistory, setPriceHistory] = useState([]);
  // State for loading spinner for chart fetch
  const [historyLoading, setHistoryLoading] = useState(true);

  // Fetch current $TAO price and 24h change from CoinGecko
  useEffect(() => {
    const fetchTao = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bittensor&vs_currencies=usd&include_24hr_change=true"
        );
        const data = await res.json();
        setTaoData(data.bittensor);
        setLastUpdated(new Date());
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchTao();
    // Refresh price every 10 seconds
    const interval = setInterval(fetchTao, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch 7-day price history for $TAO from CoinGecko
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setHistoryLoading(true);
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/bittensor/market_chart?vs_currency=usd&days=7"
        );
        const data = await res.json();
        setPriceHistory(data.prices);
      } catch (err) {
        // Optionally handle error
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Format a JS Date object as a time string (hh:mm:ss)
  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Prepare data and options for the Chart.js line chart
  const chartData = {
    labels: priceHistory.map(([timestamp]) => {
      const date = new Date(timestamp);
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
    }),
    datasets: [
      {
        label: "$TAO Price (USD)",
        data: priceHistory.map(([, price]) => price),
        fill: true,
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.2)", // transparent blue shade
        pointRadius: 0,
        tension: 0.3, // smooth line
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // hide legend
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: '#fff',
        titleColor: '#18181b',
        bodyColor: '#18181b',
        borderColor: '#6366f1',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        display: true,
        ticks: {
          maxTicksLimit: 7,
          color: '#6366f1',
        },
        grid: { display: false },
      },
      y: {
        display: true,
        ticks: { color: '#6366f1' },
        grid: { color: '#e5e7eb' },
      },
    },
  };

  return (
    // Main app container
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 font-sans transition-colors duration-300">
      {/* App title */}
      <h1 className="text-4xl font-extrabold mb-8 tracking-tight text-center text-gray-900 font-sans select-none">
        $TAO Tracker
      </h1>
      {/* Card for price and 24h change */}
      <div className="w-full max-w-md bg-white bg-opacity-90 p-8 rounded-2xl shadow-2xl flex flex-col items-center transition-colors duration-300">
        {/* $TAO Logo Placeholder */}
        <div className="mb-4">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="28" cy="28" r="28" fill="#4F46E5" />
            <text x="50%" y="54%" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold" dy=".3em">T</text>
          </svg>
        </div>
        {/* Loading spinner, error, or price display */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-32">
            <svg className="animate-spin h-8 w-8 text-indigo-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span className="text-indigo-200">Loading...</span>
          </div>
        ) : error ? (
          <div className="text-red-400 font-semibold">{error}</div>
        ) : (
          <>
            {/* Price and 24h change */}
            <div className="text-2xl font-semibold mb-2 text-indigo-700">
              Price: <span className="text-indigo-500">${taoData.usd}</span>
            </div>
            <div className="mb-2">
              24h Change: {" "}
              <span className={
                taoData.usd_24h_change >= 0
                  ? 'text-green-400'
                  : 'text-red-400'
              }>
                {taoData.usd_24h_change.toFixed(2)}%
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-2">Last updated: {formatTime(lastUpdated)}</div>
          </>
        )}
      </div>
      {/* Chart Section */}
      <div className="w-full max-w-md mt-8 bg-white bg-opacity-90 p-4 rounded-2xl shadow-xl transition-colors duration-300">
        <h2 className="text-lg font-semibold mb-4 text-indigo-700">7-Day Price Chart</h2>
        <div className="h-48 w-full">
          {/* Loading spinner or chart */}
          {historyLoading ? (
            <div className="flex flex-col items-center justify-center h-32">
              <svg className="animate-spin h-8 w-8 text-indigo-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <span className="text-indigo-200">Loading chart...</span>
            </div>
          ) : (
            <Line data={chartData} options={chartOptions} height={192} />
          )}
        </div>
      </div>
      {/* Footer */}
      <footer className="mt-8 text-gray-500 text-xs text-center opacity-80 select-none">
        Powered by CoinGecko API &bull; Built with React & Tailwind CSS
      </footer>
    </div>
  );
}

export default App;
