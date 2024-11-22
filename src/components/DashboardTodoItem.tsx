'use client';

import { Status } from "@prisma/client";
import Link from "next/link";
import DOMPurify from 'isomorphic-dompurify';
import DateDisplay from "./DateDisplay";

interface TodoItemProps {
  todo: {
    id: string;
    title: string;
    content: string | null;
    status: Status;
    createdAt: string;
  };
  title: string;
  content: string;
}

// Function to safely render HTML content
function createMarkup(content: string) {
  return { __html: DOMPurify.sanitize(content) };
}

export default function DashboardTodoItem({ todo, title, content }: TodoItemProps) {
  return (
    <div 
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
    >
      <div className="flex-1 min-w-0 pr-4">
        <Link href={`/view/${todo.id}`}>
          <h3 
            className="font-medium text-gray-900 truncate mb-1"
            dangerouslySetInnerHTML={createMarkup(title)}
          />
          {content && (
            <p 
              className="text-sm text-gray-500 truncate"
              dangerouslySetInnerHTML={createMarkup(content)}
            />
          )}
          <div className="mt-1 text-xs text-gray-400">
            Created: <DateDisplay date={todo.createdAt} />
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
  );
}
