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

export default function ViewPage({ params }: ViewPageProps) {
  const router = useRouter();
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTodo() {
      try {
        const response = await fetch(`/api/todos/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch todo');
        }
        const data = await response.json();
        setTodo(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    }

    fetchTodo();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !todo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            {error || 'Todo not found'}
          </p>
          <Link 
            href="/"
            className="mt-2 inline-block text-red-600 hover:text-red-800"
          >
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          {/* Header with Title */}
          <div className="mb-6">
            <RichTextContent
              content={todo.title}
              className="text-2xl font-bold text-gray-900 mb-2 prose prose-lg max-w-none"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(todo.category)}`}>
                {formatEnumValue(todo.category)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(todo.priority)}`}>
                {formatEnumValue(todo.priority)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(todo.status)}`}>
                {formatEnumValue(todo.status)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-6">
            <RichTextContent
              content={todo.content || ''}
              className="whitespace-pre-wrap break-words"
            />
          </div>

          {/* URL if present */}
          {todo.url && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Related Link</h3>
              <a
                href={todo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 break-all"
              >
                {todo.url}
              </a>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t pt-4 mt-6 text-sm text-gray-600">
            {todo.dueDate && (
              <p className="mb-1">
                <span className="font-semibold">Due Date:</span>{' '}
                {formatDueDate(todo.dueDate)}
              </p>
            )}
            <p className="mb-1">
              <span className="font-semibold">Created:</span>{' '}
              {formatDate(todo.createdAt)}
            </p>
            <p>
              <span className="font-semibold">Last Updated:</span>{' '}
              {formatDate(todo.updatedAt)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <button
            onClick={async () => {
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
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
          
          <div className="flex items-center gap-3">
            <Link
              href={`/edit/${todo.id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Edit
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-x-0.5"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
              Back to List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
