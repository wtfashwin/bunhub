import React, { useEffect, useState } from 'react';
import StatsCharts from '../components/StatsCharts';

export interface Stat {
  query: string;
  hits: number;
  avg_ms: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('from', fromDate);
      if (toDate) params.append('to', toDate);

      const res = await fetch(`/api/admin/stats?${params.toString()}`);
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const json = await res.json();
      setStats(json.top);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics.');
    }
  };

  useEffect(() => {
    fetchStats();
  }, [fromDate, toDate]);

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">📊 Admin Analytics Dashboard</h1>

      <div className="flex flex-wrap gap-4 items-center mb-8">
        <label className="flex flex-col text-sm">
          From:
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 px-2 py-1 rounded"
          />
        </label>

        <label className="flex flex-col text-sm">
          To:
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 px-2 py-1 rounded"
          />
        </label>

        <button
          onClick={fetchStats}
          className="ml-auto bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white text-sm transition"
        >
          Refresh 🔄
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-sm mb-4">{error}</div>
      )}

      {stats.length > 0 ? (
        <StatsCharts data={stats} />
      ) : (
        <p className="text-zinc-400 text-sm">No analytics data available for this range.</p>
      )}
    </div>
  );
}
