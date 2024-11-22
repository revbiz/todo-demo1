"use client";

import { TodoCategory, Priority, Todo } from "@/types/todo";
import { Status } from "@prisma/client";
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

type SortField = "createdAt" | "updatedAt" | "priority" | "status";
type SortDirection = "asc" | "desc";

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
  const MAX_TITLE_LENGTH = 100;
  const MAX_DESCRIPTION_LENGTH = 150;

  // Function to check if content is longer than preview
  const isContentLong = (content: string | null, type: "title" | "description"): boolean => {
    if (!content) return false;

    const cleanText = content
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .trim();

    return type === "title" 
      ? cleanText.length > MAX_TITLE_LENGTH
      : cleanText.length > MAX_DESCRIPTION_LENGTH;
  };

  // Function to process title content
  const processTitle = (title: string | null): string => {
    if (!title) return "";
    const cleanText = title
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .trim();

    if (cleanText.length <= MAX_TITLE_LENGTH) return title;
    return cleanText.substring(0, MAX_TITLE_LENGTH) + "...";
  };

  // Process description to be more compact
  const processDescription = (content: string | null): string => {
    if (!content) return "";
    const cleanText = content
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .trim();

    if (cleanText.length <= MAX_DESCRIPTION_LENGTH) return content;
    return cleanText.substring(0, MAX_DESCRIPTION_LENGTH) + "...";
  };

  const displayTitle = processTitle(todo.title);
  const isTitleTruncated = todo.title && isContentLong(todo.title, "title");
  const displayContent = processDescription(todo.content || "");

  const hasTitleOrContentLong =
    (todo.title && isContentLong(todo.title, "title")) ||
    (todo.content && isContentLong(todo.content, "description"));

  const getCategoryColor = (category: TodoCategory) => {
    switch (category) {
      case "WORK":
        return "bg-blue-100 text-blue-800";
      case "PERSONAL":
        return "bg-green-100 text-green-800";
      case "SHOPPING":
        return "bg-yellow-100 text-yellow-800";
      case "HEALTH":
        return "bg-red-100 text-red-800";
      case "EDUCATION":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.COMPLETE:
        return "bg-green-100 text-green-800";
      case Status.ACTIVE:
        return "bg-blue-100 text-blue-800";
      case Status.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case Status.HOLD:
        return "bg-orange-100 text-orange-800";
      case Status.SKIP:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-1 sm:p-2 mb-2">
      <div className="flex flex-col sm:flex-col">
        <div className="flex-grow">
          <div className="flex items-start justify-between">
            <div className="flex-grow">
              <div className="title-wrapper">
                <div className="text-lg font-semibold leading-6 text-gray-900 break-words flex flex-wrap items-baseline gap-1">
                  <div
                    className="title-content flex-grow min-w-0"
                    dangerouslySetInnerHTML={{
                      __html: processTitle(todo.title),
                    }}
                  />
                  {isContentLong(todo.title, "title") && (
                    <Link
                      href={`/view/${todo.id}`}
                      className="title-read-more text-sm text-blue-500 hover:text-blue-600 shrink-0"
                    >
                      Read more
                    </Link>
                  )}
                </div>
              </div>
              <div className="content-wrapper mt-1">
                <div
                  className="content-preview text-sm text-gray-600 break-words"
                  dangerouslySetInnerHTML={{
                    __html: processDescription(todo.content || ''),
                  }}
                />
                {isContentLong(todo.content || "", "description") && (
                  <Link
                    href={`/view/${todo.id}`}
                    className="content-read-more text-sm text-blue-500 hover:text-blue-600"
                  >
                    Read more
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(todo.category)}`}>
              {todo.category}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(todo.priority)}`}>
              {todo.priority}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(todo.status)}`}>
              {todo.status}
            </span>
          </div>

          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <div>Created: {formatDate(todo.createdAt)}</div>
            <div>Updated: {formatDate(todo.updatedAt)}</div>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-2">
          <Link
            href={`/view/${todo.id}`}
            className="text-blue-600 hover:text-blue-700 text-sm px-2 py-1 rounded hover:bg-blue-50 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View
          </Link>
          <Link
            href={`/edit/${todo.id}`}
            className="text-green-600 hover:text-green-700 text-sm px-2 py-1 rounded hover:bg-green-50 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
          <button
            onClick={() => onDelete(todo.id)}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {isDeleting ? "..." : "Delete"}
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
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedTodos = [...todos].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "createdAt":
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "updatedAt":
        comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case "priority":
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        comparison =
          (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
        break;
      case "status":
        const statusOrder = {
          COMPLETE: 0,
          ACTIVE: 1,
          PENDING: 2,
          HOLD: 3,
          SKIP: 4,
        };
        comparison =
          (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
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
          sortField === field ? "text-current" : "text-gray-400"
        } ${
          sortField === field && sortDirection === "desc"
            ? "transform rotate-180"
            : ""
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 mb-2">
        <button
          onClick={() => handleSort("createdAt")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center justify-center transition-colors duration-200 ${
            sortField === "createdAt"
              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Creation Date <SortIcon field="createdAt" />
        </button>
        <button
          onClick={() => handleSort("updatedAt")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center justify-center transition-colors duration-200 ${
            sortField === "updatedAt"
              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Last Updated <SortIcon field="updatedAt" />
        </button>
        <button
          onClick={() => handleSort("priority")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center justify-center transition-colors duration-200 ${
            sortField === "priority"
              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Priority <SortIcon field="priority" />
        </button>
        <button
          onClick={() => handleSort("status")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center justify-center transition-colors duration-200 ${
            sortField === "status"
              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Status <SortIcon field="status" />
        </button>
      </div>

      <div className="grid gap-1">
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
