"use client";

import { TodoCategory, Priority, Todo, Status } from "@/types/todo";
import RichTextContent from "./RichTextContent";
import Link from "next/link";
import { deleteTodo, updateTodo } from "@/app/actions";
import { useState } from "react";

interface TodoListProps {
  todos: Todo[];
}

export default function TodoList({ todos }: TodoListProps) {
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  const handleDelete = async (id: string) => {
    await deleteTodo(id);
  };

  const handleStatusChange = async (todo: Todo, newStatus: Status) => {
    const formData = new FormData();
    formData.append('id', todo.id);
    formData.append('title', todo.title);
    formData.append('content', todo.content || '');
    formData.append('status', newStatus);
    await updateTodo(formData);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.COMPLETE:
        return 'bg-green-100 text-green-800';
      case Status.ACTIVE:
        return 'bg-yellow-100 text-yellow-800';
      case Status.PENDING:
        return 'bg-blue-100 text-blue-800';
      case Status.HOLD:
        return 'bg-orange-100 text-orange-800';
      case Status.SKIP:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatContent = (text: string) => {
    if (!text) return '';
    
    // First handle <br> tags
    let processed = text.replace(/<br\s*\/?>/gi, ' - ');
    
    // Then handle paragraphs
    const paragraphs = processed.match(/<p[^>]*>(.*?)<\/p>/g) || [];
    processed = paragraphs
      .map(p => p.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim())
      .filter(p => p.length > 0)
      .join(' - ');
    
    // Clean up any double dashes or extra spaces
    return processed
      .replace(/\s*-\s*-\s*/g, ' - ')  // Replace multiple dashes with single dash
      .replace(/\s+/g, ' ')            // Replace multiple spaces with single space
      .trim();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {todos.map((todo) => {
        const formattedTitle = formatContent(todo.title);
        const truncatedTitle = truncateText(formattedTitle, 100);
        
        return (
          <div
            key={todo.id}
            className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ${
              selectedTodoId === todo.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedTodoId(todo.id)}
          >
            <div className="flex flex-col">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {truncatedTitle}
                </h3>
                <div className="prose max-w-none">
                  <div className="mb-1">
                    <RichTextContent content={truncateText(formatContent(todo.content || ''), 200)} />
                  </div>
                  {todo.content && (
                    <Link
                      href={`/view/${todo.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Read more
                    </Link>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded text-sm ${getStatusColor(todo.status)}`}>
                    {todo.status.replace('_', ' ')}
                  </span>
                  <span className="text-gray-500 text-sm">
                    Created: {formatDate(todo.createdAt)}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(
                        todo,
                        todo.status === Status.COMPLETE ? Status.PENDING : Status.COMPLETE
                      );
                    }}
                    className={`px-3 py-1 rounded-md text-sm ${
                      todo.status === Status.COMPLETE
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {todo.status === Status.COMPLETE ? 'Undo' : 'Complete'}
                  </button>
                  <Link
                    href={`/edit/${todo.id}`}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/view/${todo.id}`}
                    className="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(todo.id);
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
