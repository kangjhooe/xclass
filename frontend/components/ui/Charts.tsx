'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface LineChartProps {
  data: ChartData[];
  dataKey: string;
  lines?: { key: string; name: string; color?: string }[];
  height?: number;
}

export function LineChartComponent({ data, dataKey, lines = [], height = 300 }: LineChartProps) {
  const defaultLines = lines.length > 0 
    ? lines 
    : [{ key: dataKey, name: dataKey, color: COLORS[0] }];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {defaultLines.map((line, index) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name}
            stroke={line.color || COLORS[index % COLORS.length]}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

interface BarChartProps {
  data: ChartData[];
  dataKey: string;
  bars?: { key: string; name: string; color?: string }[];
  height?: number;
}

export function BarChartComponent({ data, dataKey, bars = [], height = 300 }: BarChartProps) {
  const defaultBars = bars.length > 0 
    ? bars 
    : [{ key: dataKey, name: dataKey, color: COLORS[0] }];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {defaultBars.map((bar, index) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name}
            fill={bar.color || COLORS[index % COLORS.length]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

interface PieChartProps {
  data: ChartData[];
  dataKey: string;
  nameKey?: string;
  height?: number;
}

export function PieChartComponent({ data, dataKey, nameKey = 'name', height = 300 }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(props: any) => {
            const percent = props.percent || 0;
            const name = props.name || '';
            return `${name} ${(percent * 100).toFixed(0)}%`;
          }}
          outerRadius={80}
          fill="#8884d8"
          dataKey={dataKey}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

