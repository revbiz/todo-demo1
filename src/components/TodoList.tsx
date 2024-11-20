'use client';

import { TodoCategory } from '@prisma/client';
import { TodoContent } from './TodoContent';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Todo {
  id: string;
  title: string;
  content: string | null;
  completed: boolean;
  category: TodoCategory;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Pending' | 'Complete' | 'Forget' | 'Overdue';
  createdAt: Date;
  updatedAt: Date;
}

type Priority = 'High' | 'Medium' | 'Low';

interface TodoListProps {
  todos: Todo[];
  selectedCategory: TodoCategory | 'All';
  selectedPriority: Priority | 'All';
  selectedStatus: 'Active' | 'Pending' | 'Complete' | 'Forget' | 'Overdue' | 'All';
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
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join(' · ');
}

function truncateContent(content: string): { truncated: string; isTruncated: boolean } {
  const formatted = formatContent(content);
  
  if (formatted.length <= MAX_PREVIEW_LENGTH) {
    return { truncated: formatted, isTruncated: false };
  }

  const lastSpace = formatted.lastIndexOf(' ', MAX_PREVIEW_LENGTH);
  const finalLength = lastSpace > 0 ? lastSpace : MAX_PREVIEW_LENGTH;
  
  let truncated = formatted.substring(0, finalLength);
  truncated = truncated.replace(/(?:\s*·\s*)+$/g, '');

  return {
    truncated: truncated + '...',
    isTruncated: true
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
  const [mounted, setMounted] = useState(false);
  const itemsPerPage = 3; // Match this with your server-side value

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="bg-white rounded-lg shadow p-4">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {todos.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          {selectedCategory === 'All' && selectedPriority === 'All' && selectedStatus === 'All'
            ? "No todos yet. Click \"Add New Todo\" to create one!"
            : `No todos found with the selected filters. Try different filters or add a new todo!`}
        </div>
      ) : (
        <>
          <div className="p-4 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} todos
            </p>
          </div>
          {todos.map((todo, index) => {
            const { truncated, isTruncated } = truncateContent(todo.content || todo.title);
            const displayNumber = ((currentPage - 1) * itemsPerPage) + index + 1;
            
            return (
              <div key={todo.id} className="bg-white p-4 border-b last:border-b-0 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 w-8 h-8 rounded-full text-sm font-medium">
                        {displayNumber}
                      </span>
                      <h3 className="text-lg font-semibold">{todo.title}</h3>
                    </div>
                    <div className="flex gap-2 mt-2">
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
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/edit/${todo.id}`}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/view/${todo.id}`}
                      className="text-green-500 hover:text-green-700"
                    >
                      View
                    </Link>
                    <div className="text-sm text-gray-500">
                      {formatDate(new Date(todo.createdAt))}
                    </div>
                  </div>
                </div>
                <div className="prose prose-sm mt-2">
                  <p className="text-gray-600">{truncated}</p>
                  {isTruncated && (
                    <Link
                      href={`/view/${todo.id}`}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Read more...
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
