'use client';

import { TodoCategory, Priority, Status, Todo } from '@/types/todo';
import { TodoContent } from './TodoContent';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface TodoListProps {
  todos: Todo[];
  selectedCategory: TodoCategory | 'All';
  selectedPriority: Priority | 'All';
  selectedStatus: Status | 'All';
  currentPage: number;
  totalCount: number;
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

const MAX_PREVIEW_LENGTH = 150;

function formatContent(content: string): string {
  if (!content) return '';
  
  // Remove HTML tags
  const textContent = content.replace(/<[^>]+>/g, ' ');
  
  return textContent
    .replace(/\n\s*\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateContent(content: string): { truncated: string; isTruncated: boolean } {
  const formatted = formatContent(content);
  if (formatted.length <= MAX_PREVIEW_LENGTH) {
    return {
      truncated: formatted,
      isTruncated: false,
    };
  }

  return {
    truncated: formatted.slice(0, MAX_PREVIEW_LENGTH) + '...',
    isTruncated: true,
  };
}

export function TodoList({ 
  todos, 
  selectedCategory, 
  selectedPriority, 
  selectedStatus,
  currentPage,
  totalCount
}: TodoListProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      const response = await fetch(`/api/todos?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }

      router.refresh();
    } catch (error) {
      setDeleteError('Failed to delete todo. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!todos.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No todos found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {deleteError && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          {deleteError}
        </div>
      )}

      <div className="grid gap-4">
        {todos.map((todo) => {
          const { truncated, isTruncated } = todo.content
            ? truncateContent(todo.content)
            : { truncated: '', isTruncated: false };

          return (
            <div
              key={todo.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {todo.title}
                  </h3>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 text-sm rounded-full ${
                      todo.category === 'Event'
                        ? 'bg-purple-100 text-purple-800'
                        : todo.category === 'Reminder'
                        ? 'bg-yellow-100 text-yellow-800'
                        : todo.category === 'Someday'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {todo.category}
                    </span>
                    <span className={`px-2 py-1 text-sm rounded-full ${
                      todo.priority === 'High'
                        ? 'bg-red-100 text-red-800'
                        : todo.priority === 'Medium'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {todo.priority}
                    </span>
                    <span className={`px-2 py-1 text-sm rounded-full ${
                      todo.status === 'Active'
                        ? 'bg-blue-100 text-blue-800'
                        : todo.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : todo.status === 'Complete'
                        ? 'bg-green-100 text-green-800'
                        : todo.status === 'OnHold'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {todo.status}
                    </span>
                  </div>

                  {todo.content && (
                    <div className="prose prose-sm max-w-none mb-4">
                      <TodoContent content={todo.content} />
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    <div>Created: {formatDate(todo.createdAt)}</div>
                    {todo.updatedAt && todo.updatedAt !== todo.createdAt && (
                      <div>Updated: {formatDate(todo.updatedAt)}</div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/view/${todo.id}`}
                    className="text-blue-500 hover:text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    View
                  </Link>
                  <Link
                    href={`/edit/${todo.id}`}
                    className="text-green-500 hover:text-green-600 px-3 py-1 rounded-md hover:bg-green-50 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    disabled={isDeleting}
                    className="text-red-500 hover:text-red-600 px-3 py-1 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
