'use client';

import { Status, Priority, TodoCategory } from '@prisma/client';
import { useEffect, useState } from 'react';
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

interface Todo {
  id: string;
  title: string;
  content: string | null;
  url: string | null;
  category: TodoCategory;
  priority: Priority;
  status: Status;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DashboardStatsProps {
  todos: Todo[];
}

const COLORS = {
  status: ['#4ade80', '#fbbf24', '#94a3b8', '#60a5fa', '#f87171'],
  priority: ['#ef4444', '#f59e0b', '#22c55e'],
  category: ['#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#6b7280'],
};

const STATUS_COLORS = {
  [Status.COMPLETE]: '#4ade80', // green
  [Status.ACTIVE]: '#fbbf24',   // yellow
  [Status.PENDING]: '#94a3b8',  // gray
  [Status.HOLD]: '#60a5fa',     // blue
  [Status.SKIP]: '#f87171',     // red
};

export function DashboardStats({ todos }: DashboardStatsProps) {
  const [statusData, setStatusData] = useState<any[]>([]);
  const [priorityData, setPriorityData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    // Process status data
    const statusCounts = todos.reduce((acc: { [key: string]: number }, todo) => {
      acc[todo.status] = (acc[todo.status] || 0) + 1;
      return acc;
    }, {});

    setStatusData(
      Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
      }))
    );

    // Process priority data
    const priorityCounts = todos.reduce((acc: { [key: string]: number }, todo) => {
      acc[todo.priority] = (acc[todo.priority] || 0) + 1;
      return acc;
    }, {});

    setPriorityData(
      Object.entries(priorityCounts).map(([name, value]) => ({
        name,
        value,
      }))
    );

    // Process category data
    const categoryCounts = todos.reduce((acc: { [key: string]: number }, todo) => {
      acc[todo.category] = (acc[todo.category] || 0) + 1;
      return acc;
    }, {});

    setCategoryData(
      Object.entries(categoryCounts).map(([name, value]) => ({
        name,
        value,
      }))
    );
  }, [todos]);

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
      {/* Status Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
        <div className="h-[300px]">
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
      </div>

      {/* Priority Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={priorityData}
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
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.priority[index % COLORS.priority.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
        <div className="h-[300px]">
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

      {/* Summary Stats */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Tasks</p>
            <p className="text-2xl font-bold text-blue-600">{todos.length}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Complete</p>
            <p className="text-2xl font-bold text-green-600">
              {todos.filter((todo) => todo.status === Status.COMPLETE).length}
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-yellow-600">
              {todos.filter((todo) => todo.status === Status.ACTIVE).length}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-gray-600">
              {todos.filter((todo) => todo.status === Status.PENDING).length}
            </p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-gray-600">On Hold</p>
            <p className="text-2xl font-bold text-indigo-600">
              {todos.filter((todo) => todo.status === Status.HOLD).length}
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600">Skipped</p>
            <p className="text-2xl font-bold text-red-600">
              {todos.filter((todo) => todo.status === Status.SKIP).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
