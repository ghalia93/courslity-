"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type ChartPoint = { date: string; count: number };

export default function ReviewsTrendChart({ data = [] }: { data?: ChartPoint[] }) {
  const chartData = data.map((d) => ({
    date: d.date,
    reviews: d.count,
  }));
  return (
    <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold mb-4 text-gray-700">
        Reviews Trend
      </h3>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          >
            <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#6B7280", fontSize: 12 }}
              tickLine={false}
            />
            <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fefefe",
                borderRadius: 8,
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            />
            <Bar dataKey="reviews" fill="#6155F5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
