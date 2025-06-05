'use client';

import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'white',
      titleColor: '#1a1a1a',
      bodyColor: '#1a1a1a',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: 12,
      displayColors: false,
      callbacks: {
        label: function(context: any) {
          return `$${context.parsed.y.toLocaleString()}`;
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          family: 'Inter',
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#f3f4f6',
      },
      ticks: {
        font: {
          family: 'Inter',
        },
        callback: function(value: any) {
          return `$${value.toLocaleString()}`;
        },
      },
    },
  },
};

const mockData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Earnings',
      data: [3000, 5500, 4200, 7800, 6300, 9100],
      fill: true,
      backgroundColor: 'rgba(127, 29, 29, 0.1)',
      borderColor: '#7f1d1d',
      tension: 0.4,
    },
  ],
};

const timeRanges = ['Last 6 Months', 'This Year', 'Last Year', 'All Time'];

export default function EarningsPanel() {
  const [selectedRange, setSelectedRange] = useState('Last 6 Months');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-gray-900">Earnings Overview</h1>
          <p className="text-gray-600 mt-1">Track your content creation revenue</p>
        </div>
        <select
          value={selectedRange}
          onChange={(e) => setSelectedRange(e.target.value)}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-red-burgundy focus:ring-0"
        >
          {timeRanges.map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">Total Earnings</h3>
            <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full text-sm">+12.5%</span>
          </div>
          <p className="text-3xl font-serif font-semibold text-gray-900">$35,900</p>
          <p className="text-sm text-gray-600 mt-1">vs. $31,900 last period</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">Active Campaigns</h3>
            <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-sm">8 Total</span>
          </div>
          <p className="text-3xl font-serif font-semibold text-gray-900">5</p>
          <p className="text-sm text-gray-600 mt-1">3 pending approval</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">Avg. per Campaign</h3>
            <span className="text-purple-600 bg-purple-50 px-2 py-1 rounded-full text-sm">+8.3%</span>
          </div>
          <p className="text-3xl font-serif font-semibold text-gray-900">$4,487</p>
          <p className="text-sm text-gray-600 mt-1">vs. $4,142 last period</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-lg font-semibold text-gray-900">Earnings Trend</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-burgundy"></div>
              <span className="text-sm text-gray-600">Revenue</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <Line data={mockData} options={chartOptions} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-serif text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="p-6 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Luxury Resort Campaign</h4>
                  <p className="text-sm text-gray-600">June 1, 2023</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">+ $4,500.00</p>
                <p className="text-sm text-green-600">Completed</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 