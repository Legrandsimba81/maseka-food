"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#dc2626", "#f59e0b", "#000000"];

export function OrdersBarChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#dc2626" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function OrdersPieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} dataKey="value">
          {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}