import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TrafficChart({ data }) {
  // Format data for chart (convert timestamp to time string)
  const formattedData = data.map((item) => ({
    ip: item.ip_address,
    requests: item.requests,
    time: new Date(item.timestamp).toLocaleTimeString(),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Line type="monotone" dataKey="requests" stroke="#1976d2" />
      </LineChart>
    </ResponsiveContainer>
  );
}
