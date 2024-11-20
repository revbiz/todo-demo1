"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Todo } from "@/types/todo";

function formatContent(content: string): string {
  if (!content) return '';
  
  // Split into lines and filter empty ones
  const lines = content
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
  
  // Convert to HTML with proper structure
  return `<div class="space-y-2">
    ${lines.map((line, index) => {
      if (index === 0) {
        return `<p>${line}</p>`;
      } else {
        return `<ul><li>${line}</li></ul>`;
      }
    }).join('')}
  </div>`;
}

export default function ViewTodo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const todoId = searchParams.get("id");
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (todoId) {
      fetchTodo();
    }
  }, [todoId]);

  const fetchTodo = async () => {
    try {
      const response = await fetch(`/api/todos?id=${todoId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch todo");
      }
      const todoData = await response.json();
      setTodo(todoData);
    } catch (error) {
      setError("Failed to fetch todo");
    } finally {
      setLoading(false);
    }
  };

  const deleteTodo = async () => {
    if (!todo?.id) return;

    try {
      const response = await fetch("/api/todos", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: todo.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Failed to delete todo:", error);
      setError("Failed to delete todo");
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (!todo) {
    return <div className="text-center p-4">Todo not found</div>;
  }

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-500 p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Todo Details</h1>
            <div className="flex gap-2">
              <Link
                href={`/edit?id=${todo.id}`}
                className="px-4 py-2 bg-white text-blue-500 rounded-md hover:bg-blue-50 transition-colors duration-200"
              >
                Edit
              </Link>
              <button
                onClick={deleteTodo}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
              >
                Delete
              </button>
              <Link
                href="/"
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200"
              >
                Back
              </Link>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-700">Content:</h2>
                <div 
                  className="mt-2 prose prose-sm whitespace-pre-line border rounded-md p-4 pl-6"
                  dangerouslySetInnerHTML={{ 
                    __html: todo.content ? formatContent(todo.content) : todo.title 
                  }}
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-700">Created:</h2>
                <p className="text-gray-600">
                  {new Date(todo.createdAt).toLocaleString()}
                </p>
              </div>

              {todo.updatedAt && todo.updatedAt !== todo.createdAt && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-700">Last Updated:</h2>
                  <p className="text-gray-600">
                    {new Date(todo.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
