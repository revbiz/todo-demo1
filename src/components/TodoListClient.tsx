'use client';

import { Status, TodoCategory, Priority } from "@prisma/client";
import Link from "next/link";
import DOMPurify from 'isomorphic-dompurify';

interface Todo {
  id: string;
  title: string;
  content: string | null;
  status: Status;
  category: TodoCategory;
  priority: Priority;
  url: string | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TodoListClientProps {
  todos: Todo[];
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Function to safely render HTML content
function createMarkup(content: string) {
  return { __html: DOMPurify.sanitize(content) };
}

export default function TodoListClient({ todos }: TodoListClientProps) {
  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <div 
          key={todo.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
        >
          <div className="flex-1 min-w-0 pr-4">
            <Link href={`/view/${todo.id}`}>
              <h3 
                className="font-medium text-gray-900 truncate mb-1"
                dangerouslySetInnerHTML={createMarkup(todo.title)}
              />
              {todo.content && (
                <p 
                  className="text-sm text-gray-500 truncate"
                  dangerouslySetInnerHTML={createMarkup(todo.content)}
                />
              )}
              <div className="mt-1 text-xs text-gray-400" suppressHydrationWarning>
                Created: {formatDate(todo.createdAt)}
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span 
              className={`px-2 py-1 rounded-full text-xs ${
                todo.status === Status.COMPLETE
                  ? "bg-green-100 text-green-800"
                  : todo.status === Status.PENDING
                  ? "bg-yellow-100 text-yellow-800"
                  : todo.status === Status.HOLD
                  ? "bg-orange-100 text-orange-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {todo.status}
            </span>
            <Link
              href={`/view/${todo.id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
