"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, Area } from "recharts";

// Palette de couleurs pour le pie chart
const COLORS = ["#F97316", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899"];

// Tooltip personnalisé commun
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-orange-600 dark:text-orange-400">
          {`${payload[0].name}: ${payload[0].value.toLocaleString('fr-FR')} $`}
        </p>
      </div>
    );
  }
  return null;
};

// Graphique en courbes pour l'évolution des commandes par mois
export function OrdersLineChart({ data }: { data: { name: string; value: number }[] }) {
  if (!data.length) return <p className="text-center text-gray-500">Aucune donnée</p>;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" tick={{ fill: "currentColor" }} axisLine={{ stroke: "currentColor" }} tickLine={false} />
        <YAxis tick={{ fill: "currentColor" }} axisLine={{ stroke: "currentColor" }} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#F97316", strokeWidth: 1, strokeDasharray: "4" }} />
        <Area type="monotone" dataKey="value" stroke="#F97316" strokeWidth={2} fill="url(#areaGradient)" fillOpacity={0.1} />
        <Line type="monotone" dataKey="value" stroke="#F97316" strokeWidth={2} dot={{ fill: "#F97316", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F97316" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
          </linearGradient>
        </defs>
      </LineChart>
    </ResponsiveContainer>
  );
}

// PieChart conservé (déjà joli)
export function OrdersPieChart({ data }: { data: { name: string; value: number }[] }) {
  if (!data.length) return <p className="text-center text-gray-500">Aucune donnée</p>;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}