"use client";

import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";

type RatingPoint = { rating: number; count: number };

const COLORS = ["#2F80ED", "#EB5757", "#F2C94C", "#27AE60", "#6366F1"];

export default function MetricsPieChart({ data }: { data: RatingPoint[] }) {
  // Sort descending so 5★ comes first, map to recharts shape
 const chartData = (data ?? [])
  .sort((a, b) => b.rating - a.rating)
  .map((d, i) => ({
    name: `${d.rating}★`,
    value: d.count,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold mb-4 text-gray-700">
        Rating Distribution
      </h3>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={90}
              paddingAngle={2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: 8,
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              formatter={(value?: number, name?: string) => [
                value !== undefined ? `${value}` : "0",
                name ?? "",
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
