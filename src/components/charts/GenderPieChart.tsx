'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface GenderPieChartProps {
  maleVotes: number;
  femaleVotes: number;
}

const COLORS = ['#0088FE', '#FF8042'];

export default function GenderPieChart({ maleVotes, femaleVotes }: GenderPieChartProps) {
  const data = [
    { name: 'Male Votes', value: maleVotes },
    { name: 'Female Votes', value: femaleVotes }
  ];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
}