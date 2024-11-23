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

  return (
    <div className="grid grid-cols-1 gap-4">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ${
            selectedTodoId === todo.id ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => setSelectedTodoId(todo.id)}
        >
          <div className="flex flex-col">
            <div>
              <h3 className="text-xl font-semibold mb-2 line-clamp-1">
                <RichTextContent content={todo.title} />
              </h3>
              <div className="prose max-w-none">
                <div className="line-clamp-2 mb-1">
                  <RichTextContent content={todo.content || ''} />
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
      ))}
    </div>
  );
}
