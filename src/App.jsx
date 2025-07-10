import React, { useEffect, useState } from "react";

function App() {
  const [taoData, setTaoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTao = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bittensor&vs_currencies=usd&include_24hr_change=true"
        );
        const data = await res.json();
        setTaoData(data.bittensor);
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

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">$TAO Tracker</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="text-xl mb-2">Price: ${taoData.usd}</div>
        <div>
          24h Change:{" "}
          <span className={taoData.usd_24h_change >= 0 ? "text-green-400" : "text-red-400"}>
            {taoData.usd_24h_change.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
