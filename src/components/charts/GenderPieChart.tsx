'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

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
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}