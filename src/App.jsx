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

const TIMEFRAMES = [
  { label: "7d", value: 7 },
  { label: "14d", value: 14 },
  { label: "30d", value: 30 },
  { label: "6mo", value: 180 },
  { label: "1yr", value: 365 },
];

function App() {
  const [timeframe, setTimeframe] = useState(7);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

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
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        pointRadius: 0,
        tension: 0.3,
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
      },
    },
    scales: {
      x: { display: true, grid: { display: false } },
      y: { display: true, grid: { color: "#e5e7eb" } },
    },
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-xl w-full bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">$TAO Price Chart</h1>
        <div className="flex gap-2 mb-4">
          {TIMEFRAMES.map(({ label, value }) => (
            <button
              key={value}
              className={`px-3 py-1 rounded-full border text-sm font-medium transition ${
                timeframe === value
                  ? "bg-indigo-500 text-white border-indigo-500"
                  : "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-100"
              }`}
              onClick={() => setTimeframe(value)}
              disabled={loading && timeframe === value}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="h-64 w-full">
          {loading ? (
            <div className="flex items-center justify-center h-full">Loading chart...</div>
          ) : (
            <Line data={chartData} options={chartOptions} height={256} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
