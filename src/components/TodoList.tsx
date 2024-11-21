"use client";

import { TodoCategory, Priority, Status, Todo } from "@/types/todo";
import RichTextContent from "./RichTextContent";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TodoListProps {
  todos: Todo[];
  selectedCategory: TodoCategory | "All";
  selectedPriority: Priority | "All";
  selectedStatus: Status | "All";
  currentPage: number;
  totalCount: number;
}

type SortField = 'createdAt' | 'updatedAt' | 'priority' | 'status';
type SortDirection = 'asc' | 'desc';

function formatDate(date: Date): string {
  return new Date(date).toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface TodoItemProps {
  todo: Todo;
  onDelete: (id: string) => Promise<void>;
  isDeleting: boolean;
}

function TodoItem({ todo, onDelete, isDeleting }: TodoItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const TITLE_WORD_LIMIT = 100;
  const DESCRIPTION_PREVIEW_LENGTH = 150;

  // Function to check if content is longer than preview
  const isContentLong = (
    content: string,
    type: "title" | "description"
  ): boolean => {
    // Remove HTML tags and decode HTML entities
    const text = content
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&");

    if (type === "title") {
      const wordCount = text.trim().split(/\s+/).length;
      return wordCount > TITLE_WORD_LIMIT;
    }

    return text.length > DESCRIPTION_PREVIEW_LENGTH;
  };

  // Function to process title content
  const processTitle = (title: string): string => {
    if (!title) return "";

    const text = title
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&");
    const words = text.trim().split(/\s+/);

    if (!isExpanded && words.length > TITLE_WORD_LIMIT) {
      const truncatedWords = words.slice(0, TITLE_WORD_LIMIT);
      return truncatedWords.join(" ") + "...";
    }

    return title;
  };

  // Process description to be more compact
  const processDescription = (description: string): string => {
    if (!description) return "";

    let processed = description;

    // Function to process list content
    const processListContent = (
      match: string,
      listType: "ul" | "ol"
    ): string => {
      // Extract list items and clean them
      const items =
        match
          .match(/<li[^>]*>(.*?)<\/li>/gs)
          ?.map((item) => {
            // Remove HTML tags and clean up whitespace
            return item
              .replace(/<li[^>]*>(.*?)<\/li>/s, "$1")
              .replace(/<[^>]+>/g, "") // Remove any other HTML tags
              .replace(/\s+/g, " ") // Replace multiple spaces with single space
              .trim();
          })
          .filter((item) => item.length > 0) || [];

      if (items.length === 0) return "";

      // Join items with appropriate separator
      const separator = listType === "ul" ? " • " : ", ";
      const listContent = items.join(separator);

      // For ordered lists, add "List: " prefix
      const prefix = listType === "ol" ? "List: " : "";

      return `<span class="inline-block whitespace-normal">${prefix}${listContent}</span>`;
    };

    // First clean up any newlines and spaces
    processed = processed.replace(/\n\s*/g, " ");
    processed = processed.replace(/\s+/g, " ");

    // Replace unordered lists
    processed = processed.replace(/<ul[^>]*>.*?<\/ul>/gs, (match) =>
      processListContent(match, "ul")
    );

    // Replace ordered lists
    processed = processed.replace(/<ol[^>]*>.*?<\/ol>/gs, (match) =>
      processListContent(match, "ol")
    );

    // Final cleanup of any remaining newlines or extra spaces
    processed = processed.replace(/\s+/g, " ").trim();

    return processed;
  };

  const hasTitleOrDescriptionLong =
    (todo.title && isContentLong(todo.title, "title")) ||
    (todo.description && isContentLong(todo.description, "description"));

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className={`${!isExpanded ? "line-clamp-1" : ""}`}>
            <RichTextContent
              content={processTitle(todo.title)}
              className="text-lg font-semibold mb-2"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${
                todo.category === "WORK"
                  ? "bg-blue-100 text-blue-800"
                  : todo.category === "PERSONAL"
                  ? "bg-green-100 text-green-800"
                  : todo.category === "SHOPPING"
                  ? "bg-yellow-100 text-yellow-800"
                  : todo.category === "HEALTH"
                  ? "bg-red-100 text-red-800"
                  : todo.category === "EDUCATION"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {todo.category.toLowerCase().replace("_", " ")}
            </span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${
                todo.priority === "HIGH"
                  ? "bg-red-100 text-red-800"
                  : todo.priority === "MEDIUM"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {todo.priority.toLowerCase()}
            </span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${
                todo.status === "COMPLETED"
                  ? "bg-green-100 text-green-800"
                  : todo.status === "IN_PROGRESS"
                  ? "bg-blue-100 text-blue-800"
                  : todo.status === "NOT_STARTED"
                  ? "bg-gray-100 text-gray-800"
                  : todo.status === "CANCELLED"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {todo.status.toLowerCase().replace("_", " ")}
            </span>
            {todo.dueDate && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                Due: {new Date(todo.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Description */}
          {todo.description && (
            <div
              className={`prose prose-sm max-w-none ${
                !isExpanded ? "line-clamp-2" : ""
              }`}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: processDescription(todo.description),
                }}
                className="text-sm text-gray-600 whitespace-normal"
              />
            </div>
          )}

          {/* URL */}
          {todo.url && (
            <div className="mt-2">
              <a
                href={todo.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  const urlToOpen = todo.url.trim();
                  window.open(urlToOpen, '_blank', 'noopener,noreferrer');
                }}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                {(() => {
                  try {
                    const url = new URL(todo.url.trim());
                    return url.hostname.replace(/^www\./, '');
                  } catch {
                    return todo.url.trim();
                  }
                })()}
              </a>
            </div>
          )}

          {/* Read More Button */}
          {hasTitleOrDescriptionLong && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-500 hover:text-blue-600 text-sm mt-1"
            >
              {isExpanded ? "Show Less" : "Read More"}
            </button>
          )}

          {/* Timestamps */}
          <div className="text-xs text-gray-500 mt-2">
            <span>Created: {formatDate(todo.createdAt)}</span>
            {todo.updatedAt && todo.updatedAt !== todo.createdAt && (
              <span className="ml-2">
                Updated: {formatDate(todo.updatedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <Link
            href={`/view/${todo.id}`}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
          >
            <svg 
              className="w-4 h-4 mr-1.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View
          </Link>
          <Link
            href={`/edit/${todo.id}`}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition-colors duration-200"
          >
            <svg 
              className="w-4 h-4 mr-1.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </Link>
          <button
            onClick={() => onDelete(todo.id)}
            disabled={isDeleting}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg 
              className="w-4 h-4 mr-1.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function TodoList({
  todos,
  selectedCategory,
  selectedPriority,
  selectedStatus,
  currentPage,
  totalCount,
}: TodoListProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTodos = [...todos].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case 'priority':
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
        break;
      case 'status':
        const statusOrder = { ACTIVE: 0, PENDING: 1, HOLD: 2, SKIP: 3, COMPLETE: 4 };
        comparison = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this todo?")) {
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }

      router.refresh();
    } catch (error) {
      setDeleteError("Failed to delete todo. Please try again.");
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

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="ml-1 inline-flex items-center">
      <svg 
        className={`w-4 h-4 transition-transform duration-200 ${
          sortField === field 
            ? 'text-current' 
            : 'text-gray-400'
        } ${
          sortField === field && sortDirection === 'desc' 
            ? 'transform rotate-180' 
            : ''
        }`}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 15l7-7 7 7"
        />
      </svg>
    </span>
  );

  return (
    <div className="space-y-3 p-4">
      {deleteError && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          {deleteError}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => handleSort('createdAt')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors duration-200 ${
            sortField === 'createdAt' 
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Creation Date <SortIcon field="createdAt" />
        </button>
        <button 
          onClick={() => handleSort('updatedAt')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors duration-200 ${
            sortField === 'updatedAt' 
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Last Updated <SortIcon field="updatedAt" />
        </button>
        <button 
          onClick={() => handleSort('priority')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors duration-200 ${
            sortField === 'priority' 
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Priority <SortIcon field="priority" />
        </button>
        <button 
          onClick={() => handleSort('status')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors duration-200 ${
            sortField === 'status' 
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Status <SortIcon field="status" />
        </button>
      </div>

      <div className="grid gap-3">
        {sortedTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        ))}
      </div>
    </div>
  );
}
