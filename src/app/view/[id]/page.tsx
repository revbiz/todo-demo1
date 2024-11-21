"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TodoCategory, Priority, Status } from "@prisma/client";
import RichTextContent from '@/components/RichTextContent';

interface Todo {
  id: string;
  title: string;
  content: string | null;
  category: TodoCategory;
  priority: Priority;
  status: Status;
  dueDate: string | null;
  url: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ViewPageProps {
  params: {
    id: string;
  };
}

function formatDate(date: string): string {
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

function getCategoryColor(category: TodoCategory): string {
  switch (category) {
    case TodoCategory.WORK:
      return 'bg-blue-100 text-blue-800';
    case TodoCategory.PERSONAL:
      return 'bg-green-100 text-green-800';
    case TodoCategory.SHOPPING:
      return 'bg-purple-100 text-purple-800';
    case TodoCategory.HEALTH:
      return 'bg-red-100 text-red-800';
    case TodoCategory.EDUCATION:
      return 'bg-yellow-100 text-yellow-800';
    case TodoCategory.OTHER:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case Priority.HIGH:
      return 'bg-red-100 text-red-800';
    case Priority.MEDIUM:
      return 'bg-yellow-100 text-yellow-800';
    case Priority.LOW:
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusColor(status: Status): string {
  switch (status) {
    case Status.ACTIVE:
      return 'bg-blue-100 text-blue-800';
    case Status.COMPLETE:
      return 'bg-green-100 text-green-800';
    case Status.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case Status.HOLD:
      return 'bg-orange-100 text-orange-800';
    case Status.SKIP:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatEnumValue(value: string): string {
  return value.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
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
        const data = await response.json();
        setTodo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTodo();
  }, [todoId]);

  const handleDelete = async () => {
    if (!todo || !confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
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
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-md">
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
      <div className="mb-6 flex justify-between items-center">
        <Link
          href="/"
          className="text-blue-500 hover:text-blue-700"
        >
          ← Back to Todos
        </Link>
        <div className="space-x-2">
          <Link
            href={`/edit/${todo.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <RichTextContent content={todo.title} className="text-2xl font-bold leading-normal" />
        </div>

        {/* Content */}
        {todo.content && (
          <div className="mb-6">
            <RichTextContent content={todo.content} className="prose max-w-none" />
          </div>
        )}

        {/* URL */}
        {todo.url && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Related Link
            </h2>
            <div className="flex items-center gap-2">
              <a
                href={todo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline break-all"
              >
                {todo.url}
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(todo.url || '');
                }}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                title="Copy URL"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Metadata Section */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className={`px-2 py-1 text-sm rounded-full ${getCategoryColor(todo.category)}`}>
            {formatEnumValue(todo.category)}
          </span>
          <span className={`px-2 py-1 text-sm rounded-full ${getPriorityColor(todo.priority)}`}>
            {formatEnumValue(todo.priority)}
          </span>
          <span className={`px-2 py-1 text-sm rounded-full ${getStatusColor(todo.status)}`}>
            {formatEnumValue(todo.status)}
          </span>
        </div>

        {/* Due Date */}
        {todo.dueDate && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Due Date</h2>
            <p className="text-gray-600">
              {formatDueDate(todo.dueDate)}
            </p>
          </div>
        )}

        {/* Created/Updated Info */}
        <div className="text-sm text-gray-500 border-t pt-4 mt-4">
          <p>Created: {formatDate(todo.createdAt)}</p>
          <p>Last Updated: {formatDate(todo.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
}
