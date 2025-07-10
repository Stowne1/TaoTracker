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
  const [taoData, setTaoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

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
    const interval = setInterval(fetchTao, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

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

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Prepare chart data
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
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.08)",
        pointRadius: 0,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: '#18181b',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#6366f1',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    elements: {
      line: {
        borderWidth: 3,
      },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-2">
      <main className="w-full max-w-md bg-white/5 backdrop-blur-md rounded-3xl shadow-2xl p-8 flex flex-col items-center">
        {/* $TAO Logo */}
        <div className="mb-6">
          <svg width="64" height="64" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="28" cy="28" r="28" fill="#4F46E5" />
            <text x="50%" y="54%" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold" dy=".3em">T</text>
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">$TAO</h1>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-24">
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
            <div className="text-5xl font-bold text-white mb-2">${taoData.usd}</div>
            <div className="mb-4">
              <span className={`text-lg font-medium px-3 py-1 rounded-full ${taoData.usd_24h_change >= 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                {taoData.usd_24h_change >= 0 ? "+" : ""}{taoData.usd_24h_change.toFixed(2)}%
              </span>
            </div>
            <div className="w-full mb-2">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center h-32">
                  <svg className="animate-spin h-8 w-8 text-indigo-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  <span className="text-indigo-200">Loading chart...</span>
                </div>
              ) : (
                <Line data={chartData} options={chartOptions} height={160} />
              )}
            </div>
            <div className="text-xs text-gray-400 mt-2 mb-1">Last updated: {formatTime(lastUpdated)}</div>
          </>
        )}
      </main>
      <footer className="absolute bottom-4 left-0 right-0 text-center text-gray-500 text-xs opacity-70 select-none">
        Powered by CoinGecko API &bull; Built with React & Tailwind CSS
      </footer>
    </div>
  );
}

export default App;
