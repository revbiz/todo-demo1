"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TodoCategory, Priority, Status } from "@prisma/client";

interface Todo {
  id: string;
  title: string;
  content: string | null;
  completed: boolean;
  category: TodoCategory;
  priority: Priority;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ViewTodo({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: todoId } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [todo, setTodo] = useState<Todo | null>(null);

  useEffect(() => {
    if (todoId) {
      fetchTodo();
    }
  }, [todoId]);

  const fetchTodo = async () => {
    try {
      const response = await fetch(`/api/todos?id=${todoId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch todo");
      }
      const todoData: Todo = await response.json();
      setTodo(todoData);
    } catch (error) {
      setError("Failed to fetch todo");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !todo) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error || "Todo not found"}
        </div>
        <div className="mt-4">
          <Link
            href="/"
            className="text-blue-500 hover:text-blue-700"
          >
            ← Back to Todos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/"
          className="text-blue-500 hover:text-blue-700"
        >
          ← Back to Todos
        </Link>
        <Link
          href={`/edit/${todo.id}`}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Edit Todo
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">{todo.title}</h1>

        <div className="flex gap-2 mb-4">
          <span
            className={`px-2 py-1 text-sm rounded-full ${
              todo.category === 'Event'
                ? 'bg-purple-100 text-purple-800'
                : todo.category === 'Reminder'
                ? 'bg-yellow-100 text-yellow-800'
                : todo.category === 'Someday'
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {todo.category}
          </span>
          <span
            className={`px-2 py-1 text-sm rounded-full ${
              todo.priority === 'High'
                ? 'bg-red-100 text-red-800'
                : todo.priority === 'Medium'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {todo.priority}
          </span>
          <span
            className={`px-2 py-1 text-sm rounded-full ${
              todo.status === 'Active'
                ? 'bg-blue-100 text-blue-800'
                : todo.status === 'Pending'
                ? 'bg-yellow-100 text-yellow-800'
                : todo.status === 'Complete'
                ? 'bg-green-100 text-green-800'
                : todo.status === 'Forget'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {todo.status}
          </span>
        </div>

        <div 
          className="prose prose-sm max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: todo.content || '' }}
        />

        <div className="text-sm text-gray-500 space-y-1">
          <div>Created: {formatDate(new Date(todo.createdAt))}</div>
          {todo.updatedAt && todo.updatedAt !== todo.createdAt && (
            <div>Updated: {formatDate(new Date(todo.updatedAt))}</div>
          )}
        </div>
      </div>
    </div>
  );
}
