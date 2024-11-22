'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DashboardChartsProps {
  statusStats: {
    completed: number;
    pending: number;
    hold: number;
    active: number;
    skip: number;
  };
  priorityStats: {
    high: number;
    medium: number;
    low: number;
  };
  categoryStats: {
    work: number;
    personal: number;
    shopping: number;
    health: number;
    education: number;
    other: number;
  };
}

const COLORS = {
  status: ['#4ade80', '#fbbf24', '#94a3b8', '#60a5fa', '#f87171'],
  priority: ['#ef4444', '#f59e0b', '#22c55e'],
  category: ['#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#6b7280'],
};

export default function DashboardCharts({ statusStats, priorityStats, categoryStats }: DashboardChartsProps) {
  const statusData = [
    { name: 'Completed', value: statusStats.completed },
    { name: 'Pending', value: statusStats.pending },
    { name: 'On Hold', value: statusStats.hold },
    { name: 'Active', value: statusStats.active },
    { name: 'Skipped', value: statusStats.skip },
  ];

  const priorityData = [
    { name: 'High', value: priorityStats.high },
    { name: 'Medium', value: priorityStats.medium },
    { name: 'Low', value: priorityStats.low },
  ];

  const categoryData = [
    { name: 'Work', value: categoryStats.work },
    { name: 'Personal', value: categoryStats.personal },
    { name: 'Shopping', value: categoryStats.shopping },
    { name: 'Health', value: categoryStats.health },
    { name: 'Education', value: categoryStats.education },
    { name: 'Other', value: categoryStats.other },
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-4 rounded-lg shadow h-[300px]">
        <h3 className="text-lg font-semibold mb-4 text-center">Status Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS.status[index % COLORS.status.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-lg shadow h-[300px]">
        <h3 className="text-lg font-semibold mb-4 text-center">Priority Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={priorityData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {priorityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS.priority[index % COLORS.priority.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-lg shadow h-[300px]">
        <h3 className="text-lg font-semibold mb-4 text-center">Tasks by Category</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={categoryData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8">
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS.category[index % COLORS.category.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
