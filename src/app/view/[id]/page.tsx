"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TodoCategory, Priority, Status } from "@prisma/client";
import { RichTextContent } from '@/components/RichTextContent';

interface Todo {
  id: string;
  title: string;
  description: string | null;
  category: TodoCategory;
  priority: Priority;
  status: Status;
  dueDate: string | null;
  url: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ViewPageProps {
  params: {
    id: string;
  };
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

function formatDueDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default function ViewTodo({
  params,
}: ViewPageProps) {
  const router = useRouter();
  const todoId = params.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [todo, setTodo] = useState<Todo | null>(null);

  useEffect(() => {
    const fetchTodo = async () => {
      try {
        const response = await fetch(`/api/todos/${todoId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch todo');
        }
        const data: Todo = await response.json();
        setTodo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTodo();
  }, [todoId]);

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

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error}
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

  if (!todo) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          Todo not found
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
        <RichTextContent 
          content={todo.title} 
          className="text-2xl font-bold mb-4"
        />

        {/* Description */}
        {todo.description && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <RichTextContent content={todo.description} className="prose max-w-none" />
          </div>
        )}

        {/* URL */}
        {todo.url && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">URL</h2>
            <a
              href={todo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {todo.url}
            </a>
          </div>
        )}

        {/* Metadata Section */}
        <div className="flex flex-wrap gap-2 mb-6">
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
                : todo.status === 'OnHold'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {todo.status}
          </span>
        </div>

        {/* Due Date Section */}
        {todo.dueDate && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-1">Due Date</h2>
            <p className="text-gray-900">
              {formatDueDate(todo.dueDate)}
            </p>
          </div>
        )}

        {/* Timestamps Section */}
        <div className="border-t pt-4 mt-6">
          <div className="text-sm text-gray-500 space-y-1">
            <div>Created: {formatDate(new Date(todo.createdAt))}</div>
            {todo.updatedAt && todo.updatedAt !== todo.createdAt && (
              <div>Updated: {formatDate(new Date(todo.updatedAt))}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
