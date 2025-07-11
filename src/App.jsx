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
  // State for current price and 24h high
  const [currentPrice, setCurrentPrice] = useState(null);
  const [high24h, setHigh24h] = useState(null);
  // State for loading spinner for price fetch
  const [priceLoading, setPriceLoading] = useState(true);

  // Fetch current price and 24h high from CoinGecko
  useEffect(() => {
    const fetchCurrent = async () => {
      setPriceLoading(true);
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/bittensor?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false"
        );
        const data = await res.json();
        setCurrentPrice(data.market_data.current_price.usd);
        setHigh24h(data.market_data.high_24h.usd);
      } catch (e) {
        setCurrentPrice(null);
        setHigh24h(null);
      } finally {
        setPriceLoading(false);
      }
    };
    fetchCurrent();
    // Refresh price every 10 seconds
    const interval = setInterval(fetchCurrent, 10000);
    return () => clearInterval(interval);
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
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.08)", // subtle blue shade
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
      },
    },
    scales: {
      x: { display: true, grid: { display: false } },
      y: { display: true, grid: { color: "#e5e7eb" } },
    },
  };

  return (
    // Main app container
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-2 py-8">
      <div className="w-full max-w-xl mx-auto flex flex-col gap-8">
        {/* Card for price, 24h high, and chart */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center mx-auto w-full max-w-xl">
          {/* App title */}
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">$TAO Price Chart</h1>
          {/* Current price and 24h high */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full justify-center items-center">
            {/* Price skeleton */}
            <div className="text-lg font-semibold text-gray-800 min-w-[160px]">
              Current Price:{' '}
              {priceLoading ? (
                <span className="inline-block align-middle">
                  <span className="inline-block h-5 w-20 bg-gray-200 rounded animate-pulse" />
                </span>
              ) : currentPrice !== null ? (
                <span className="text-indigo-600">${currentPrice.toLocaleString()}</span>
              ) : (
                <span className="text-red-500">N/A</span>
              )}
            </div>
            <div className="text-lg font-semibold text-gray-800 min-w-[160px]">
              24h High:{' '}
              {priceLoading ? (
                <span className="inline-block align-middle">
                  <span className="inline-block h-5 w-20 bg-gray-200 rounded animate-pulse" />
                </span>
              ) : high24h !== null ? (
                <span className="text-green-600">${high24h.toLocaleString()}</span>
              ) : (
                <span className="text-red-500">N/A</span>
              )}
            </div>
          </div>
          {/* Timeframe selector */}
          <div className="flex gap-2 mb-6 flex-wrap justify-center">
            {TIMEFRAMES.map(({ label, value }) => (
              <button
                key={value}
                className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2
                  ${timeframe === value
                    ? "bg-indigo-600 text-white border-indigo-600 shadow"
                    : "bg-white text-indigo-700 border-gray-300 hover:bg-indigo-50 hover:border-indigo-400"}
                `}
                onClick={() => setTimeframe(value)}
                disabled={loading && timeframe === value}
                style={{ minWidth: 56 }}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Chart section with skeleton */}
          <div className="h-64 w-full flex items-center justify-center">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-full h-40 bg-gray-200 rounded animate-pulse" />
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
