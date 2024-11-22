import { getTodos } from "@/app/actions";
import { Priority, Status, TodoCategory } from "@prisma/client";
import Link from "next/link";
import DOMPurify from 'isomorphic-dompurify';
import TodoListClient from "@/components/TodoListClient";
import { DashboardStats } from "@/components/DashboardStats";
import { Suspense } from "react";

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 150;

// Function to safely render HTML content
function createMarkup(content: string) {
  return { __html: DOMPurify.sanitize(content) };
}

// Function to process and truncate content
function processContent(content: string | null, maxLength: number): { 
  displayContent: string, 
  isTruncated: boolean 
} {
  if (!content) return { displayContent: "", isTruncated: false };
  
  // Replace carriage returns and line breaks with spaces
  const processedContent = content
    .replace(/<br\s*\/?>/gi, ' ')  // Replace <br> tags with space
    .replace(/\r?\n|\r/g, ' ')     // Replace line breaks with space
    .replace(/\s+/g, ' ');         // Replace multiple spaces with single space

  const cleanText = processedContent
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();

  const isTruncated = cleanText.length > maxLength;
  const displayContent = isTruncated 
    ? processedContent.substring(0, maxLength) + "..."
    : processedContent;

  return { displayContent, isTruncated };
}

// Set cache options to ensure fresh data on each request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const todos = await getTodos();
  
  // Process todos for display
  const processedTodos = todos.slice(0, 5).map(todo => ({
    ...todo,
    title: processContent(todo.title, MAX_TITLE_LENGTH).displayContent,
    content: todo.content ? processContent(todo.content, MAX_DESCRIPTION_LENGTH).displayContent : null,
  }));
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-4">
          <Link 
            href="/viewall"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
              />
            </svg>
            View All Todos
          </Link>
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
              />
            </svg>
            Home
          </Link>
        </div>
      </div>
      
      <DashboardStats todos={todos} />
      
      {/* Recent Todos */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Todos</h2>
          <span className="text-sm text-gray-500">Showing last 5 todos</span>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <TodoListClient todos={processedTodos} />
        </Suspense>
      </div>
    </div>
  );
}
