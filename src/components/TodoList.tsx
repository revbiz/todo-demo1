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
  const TITLE_WORD_LIMIT = 50;
  const DESCRIPTION_PREVIEW_LENGTH = 100;

  // Function to check if content is longer than preview
  const isContentLong = (
    content: string | null,
    type: "title" | "description" | "content"
  ): boolean => {
    if (!content) return false;

    // Remove HTML tags and decode HTML entities
    const text = content
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .trim();

    if (type === "title") {
      // Count newlines to determine if title is multiline
      const lineCount = (text.match(/<\/p>/g) || []).length;
      return lineCount > 1 || text.length > 100;
    }

    // For content, check for multiple paragraphs or long text
    const lineCount = (text.match(/<\/p>/g) || []).length;
    return lineCount > 2 || text.length > 200;
  };

  // Function to process title content
  const processTitle = (title: string | null): string => {
    if (!title) return "";

    // Extract text content from paragraphs and join with dashes
    const paragraphs = title.match(/<p>(.*?)<\/p>/g) || [];
    const processedParagraphs = paragraphs
      .map((p) =>
        p
          .replace(/<p>/g, "")
          .replace(/<\/p>/g, "")
          .replace(/<[^>]*>/g, "") // Keep other HTML formatting
          .trim()
      )
      .filter((p) => p); // Remove empty paragraphs

    return processedParagraphs.join(" - ");
  };

  // Process description to be more compact
  const processDescription = (description: string | null): string => {
    if (!description) return "";

    // Only truncate if not expanded and content is long
    if (!isExpanded && isContentLong(description, "description")) {
      const textContent = description
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&");

      return `${textContent.slice(0, DESCRIPTION_PREVIEW_LENGTH)}...`;
    }

    return description;
  };

  const processContent = (content: string | null): string => {
    if (!content) return "";

    // Extract text content from paragraphs and join with dashes
    const paragraphs = content.match(/<p>(.*?)<\/p>/g) || [];
    const processedParagraphs = paragraphs
      .map((p) =>
        p
          .replace(/<p>/g, "")
          .replace(/<\/p>/g, "")
          .replace(/<[^>]*>/g, "") // Keep other HTML formatting
          .trim()
      )
      .filter((p) => p); // Remove empty paragraphs

    // For lists, extract list items
    const listItems = content.match(/<li>(.*?)<\/li>/g) || [];
    const processedListItems = listItems
      .map((li) =>
        li
          .replace(/<li>/g, "")
          .replace(/<\/li>/g, "")
          .replace(/<p>/g, "")
          .replace(/<\/p>/g, "")
          .replace(/<[^>]*>/g, "")
          .trim()
      )
      .filter((li) => li);

    // Combine paragraphs and list items
    const allItems = [...processedParagraphs];
    if (listItems.length > 0) {
      allItems.push(`List items: ${processedListItems.join(", ")}`);
    }

    return allItems.join(" - ");
  };

  const displayTitle = processTitle(todo.title);
  const isTitleTruncated = todo.title && isContentLong(todo.title, "title");
  const displayContent = processContent(todo.description || "");

  const hasTitleOrDescriptionLong =
    (todo.title && isContentLong(todo.title, "title")) ||
    (todo.description && isContentLong(todo.description, "content"));

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
    <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 mb-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex-grow min-w-0 space-y-2">
          <div className="title-wrapper">
            <div className="text-base sm:text-lg font-semibold flex flex-wrap items-baseline gap-1">
              <div
                className="title-content flex-grow"
                dangerouslySetInnerHTML={{
                  __html: `<p>${processTitle(todo.title)}</p>`,
                }}
              />
              {isContentLong(todo.title, "title") && (
                <Link href={`/view/${todo.id}`} className="title-read-more shrink-0">
                  Read more
                </Link>
              )}
            </div>
          </div>

          <div className="prose prose-sm max-w-none">
            <div className="content-wrapper">
              <div
                className="content-preview"
                dangerouslySetInnerHTML={{
                  __html: `<p>${processContent(todo.description || "")}</p>`,
                }}
              />
              {isContentLong(todo.description || "", "content") && (
                <Link href={`/view/${todo.id}`} className="content-read-more">
                  Read more
                </Link>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <span
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm ${getCategoryColor(
                todo.category
              )}`}
            >
              {todo.category}
            </span>
            <span
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm ${getPriorityColor(
                todo.priority
              )}`}
            >
              {todo.priority}
            </span>
            <span
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm ${getStatusColor(
                todo.status
              )}`}
            >
              {todo.status}
            </span>
          </div>
        </div>

        <div className="flex flex-row sm:flex-col gap-1.5 sm:gap-2 justify-end mt-2 sm:mt-0">
          <Link
            href={`/view/${todo.id}`}
            className="flex-1 sm:flex-initial bg-green-500 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hover:bg-green-600 inline-flex items-center justify-center min-w-[50px] sm:min-w-[60px]"
          >
            View
          </Link>
          <Link
            href={`/edit/${todo.id}`}
            className="flex-1 sm:flex-initial bg-blue-500 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hover:bg-blue-600 inline-flex items-center justify-center min-w-[50px] sm:min-w-[60px]"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(todo.id)}
            disabled={isDeleting}
            className="flex-1 sm:flex-initial bg-red-500 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hover:bg-red-600 inline-flex items-center justify-center min-w-[50px] sm:min-w-[60px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "..." : "Delete"}
          </button>
        </div>
      </div>

      {todo.url && (
        <div className="mt-3 p-2 bg-gray-50 rounded flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <span className="text-xs sm:text-sm text-gray-600 font-medium whitespace-nowrap">
            Related Link:
          </span>
          <a
            href={todo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 break-all text-xs sm:text-sm flex-grow"
          >
            {todo.url}
          </a>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500 flex flex-col sm:flex-row gap-1 sm:gap-4">
        <span>Created: {formatDate(todo.createdAt)}</span>
        <span>Updated: {formatDate(todo.updatedAt)}</span>
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

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleSort("createdAt")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors duration-200 ${
            sortField === "createdAt"
              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Creation Date <SortIcon field="createdAt" />
        </button>
        <button
          onClick={() => handleSort("updatedAt")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors duration-200 ${
            sortField === "updatedAt"
              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Last Updated <SortIcon field="updatedAt" />
        </button>
        <button
          onClick={() => handleSort("priority")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors duration-200 ${
            sortField === "priority"
              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Priority <SortIcon field="priority" />
        </button>
        <button
          onClick={() => handleSort("status")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors duration-200 ${
            sortField === "status"
              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
