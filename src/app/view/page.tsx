"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TodoCategory, Priority, Status } from "@prisma/client";

interface Todo {
  id: string;
  title: string;
  content: string | null;
  category: TodoCategory;
  priority: Priority;
  status: Status;
  dueDate: string | null;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

function formatContent(content: string): string {
  if (!content) return '';
  
  // Split into lines and filter empty ones
  const lines = content
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
  
  // Convert to HTML with proper structure
  return `<div class="space-y-2">
    ${lines.map((line, index) => {
      if (index === 0) {
        return `<p>${line}</p>`;
      } else {
        return `<ul><li>${line}</li></ul>`;
      }
    }).join('')}
  </div>`;
}

function getCategoryColor(category: TodoCategory): string {
  switch (category) {
    case 'WORK':
      return 'bg-blue-100 text-blue-800';
    case 'PERSONAL':
      return 'bg-purple-100 text-purple-800';
    case 'SHOPPING':
      return 'bg-green-100 text-green-800';
    case 'HEALTH':
      return 'bg-red-100 text-red-800';
    case 'EDUCATION':
      return 'bg-yellow-100 text-yellow-800';
    case 'OTHER':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-100 text-red-800';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800';
    case 'LOW':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusColor(status: Status): string {
  switch (status) {
    case 'NOT_STARTED':
      return 'bg-gray-100 text-gray-800';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    case 'ON_HOLD':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function TodoView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const todoId = searchParams.get("id");
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      const todoData = await response.json();
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
          <span className={`px-2 py-1 text-sm rounded-full ${getCategoryColor(todo.category)}`}>
            {todo.category.replace(/_/g, ' ')}
          </span>
          <span className={`px-2 py-1 text-sm rounded-full ${getPriorityColor(todo.priority)}`}>
            {todo.priority.replace(/_/g, ' ')}
          </span>
          <span className={`px-2 py-1 text-sm rounded-full ${getStatusColor(todo.status)}`}>
            {todo.status.replace(/_/g, ' ')}
          </span>
        </div>

        {todo.content && (
          <div 
            className="prose prose-sm max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: formatContent(todo.content) }}
          />
        )}

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

        {todo.dueDate && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Due Date</h2>
            <p className="text-gray-600">
              {new Date(todo.dueDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}

        <div className="text-sm text-gray-500 border-t pt-4 mt-4">
          <p>Created: {new Date(todo.createdAt).toLocaleString()}</p>
          {todo.updatedAt && todo.updatedAt !== todo.createdAt && (
            <p>Updated: {new Date(todo.updatedAt).toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ViewTodoPage() {
  return (
    <Suspense fallback={
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
    }>
      <TodoView />
    </Suspense>
  );
}
