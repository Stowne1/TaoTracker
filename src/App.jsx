import React, { useEffect, useState } from "react";

function App() {
  const [taoData, setTaoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

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

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-2">
      <h1 className="text-4xl font-extrabold mb-8 tracking-tight text-center">$TAO Tracker</h1>
      <div
        className="w-full max-w-sm bg-gray-800 bg-opacity-90 p-8 rounded-2xl shadow-2xl transition-transform transform hover:scale-105 flex flex-col items-center"
      >
        {/* $TAO Logo Placeholder */}
        <div className="mb-4">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="28" cy="28" r="28" fill="#4F46E5" />
            <text x="50%" y="54%" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold" dy=".3em">T</text>
          </svg>
        </div>
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
            <div className="text-2xl font-semibold mb-2">Price: <span className="text-indigo-300">${taoData.usd}</span></div>
            <div className="mb-2">
              24h Change: {" "}
              <span className={taoData.usd_24h_change >= 0 ? "text-green-400" : "text-red-400"}>
                {taoData.usd_24h_change.toFixed(2)}%
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-2">Last updated: {formatTime(lastUpdated)}</div>
          </>
        )}
      </div>
      <footer className="mt-8 text-gray-500 text-xs text-center opacity-80">
        Powered by CoinGecko API &bull; Built with React & Tailwind CSS
      </footer>
    </div>
  );
}

export default App;
