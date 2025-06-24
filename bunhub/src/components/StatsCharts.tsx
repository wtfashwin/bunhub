import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import type { Stat } from '../pages/AdminPage';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Title, Tooltip, Legend
);

interface Props {
  data: Stat[];
}

export default function StatsCharts({ data }: Props) {
  const labels = data.map(s => s.query);
  const hits = data.map(s => s.hits);
  const avgMs = data.map(s => s.avg_ms);

  const barData = {
    labels,
    datasets: [{
      label: 'Hits',
      data: hits,
      backgroundColor: 'rgba(56, 189, 248, 0.6)'
    }]
  };

  const lineData = {
    labels,
    datasets: [{
      label: 'Avg Response Time (ms)',
      data: avgMs,
      borderColor: '#38bdf8',
      backgroundColor: 'rgba(56, 189, 248, 0.3)',
      tension: 0.3
    }]
  };

  return (
    <div className="space-y-12">
      <div>
        <h3 className="text-lg font-medium mb-2">🔍 Top Queries (Hits)</h3>
        <Bar data={barData} />
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">⏱ Response Time Trend</h3>
        <Line data={lineData} />
      </div>
    </div>
  );
}
