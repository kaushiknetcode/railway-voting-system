'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface UnitBarChartProps {
  data: {
    name: string;
    totalVoters: number;
    votedCount: number;
  }[];
}

export default function UnitBarChart({ data }: UnitBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 40, bottom: 100 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={100}
          interval={0}
          tick={{ fontSize: 12 }}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="totalVoters" fill="#8884d8" name="Total Voters" />
        <Bar dataKey="votedCount" fill="#82ca9d" name="Votes Cast" />
      </BarChart>
    </ResponsiveContainer>
  );
}