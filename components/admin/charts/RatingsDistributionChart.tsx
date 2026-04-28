"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type CourseRatingPoint = {
  courseId: number;
  code: string;
  title: string;
  averageRating: number;
  reviewCount: number;
};

function CourseRatingTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: CourseRatingPoint }>;
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-lg bg-white px-3 py-2 shadow-lg border border-gray-200">
      <p className="text-sm font-semibold text-gray-900">{point.code}</p>
      <p className="text-xs text-gray-500">{point.title}</p>
      <p className="mt-2 text-xs text-gray-600">
        Average rating:{" "}
        <span className="font-medium text-gray-900">
          {point.averageRating.toFixed(2)} / 5
        </span>
      </p>
      <p className="text-xs text-gray-600">
        Reviews:{" "}
        <span className="font-medium text-gray-900">{point.reviewCount}</span>
      </p>
    </div>
  );
}

export default function RatingsDistributionChart({
  data = [],
}: {
  data?: CourseRatingPoint[];
}) {
  const chartData = [...data].map((point) => ({
    ...point,
    courseLabel: point.code,
  }));

  return (
    <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold mb-4 text-gray-700">
        Course Rating Distribution
      </h3>
      <p className="mb-4 text-xs text-gray-500">
        Average overall rating for each course with at least one review.
      </p>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          >
            <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
            <XAxis
              dataKey="courseLabel"
              tick={{ fill: "#6B7280", fontSize: 12 }}
              tickLine={false}
              minTickGap={18}
            />
            <YAxis
              domain={[0, 5]}
              ticks={[0, 1, 2, 3, 4, 5]}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: 8,
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              content={({ active, payload }) => (
                <CourseRatingTooltip
                  active={active}
                  payload={payload as Array<{ payload: CourseRatingPoint }> | undefined}
                />
              )}
            />
            <Line
              type="monotone"
              dataKey="averageRating"
              stroke="#2F80ED"
              strokeWidth={3}
              dot={{ r: 3, fill: "#2F80ED", stroke: "#fff", strokeWidth: 1.5 }}
              activeDot={{
                r: 6,
                fill: "#2F80ED",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
