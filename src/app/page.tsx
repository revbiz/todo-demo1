"use client";

import { useState, useEffect } from "react";
import { Todo } from "@/types/todo";

const ITEMS_PER_PAGE = 3;

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [recordNumbers, setRecordNumbers] = useState<Map<string, number>>(new Map());
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      console.log("Fetching todos...");
      const response = await fetch("/api/todos");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status}, details: ${
            errorData.details || "Unknown error"
          }`
        );
      }
      const data = await response.json();
      // Convert the ISO date strings back to Date objects
      const todosWithDates = data.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
      }));
      console.log("Fetched todos:", todosWithDates);
      setTodos(todosWithDates);
      
      // Assign record numbers to new todos
      const newRecordNumbers = new Map();
      todosWithDates.forEach((todo: Todo, index: number) => {
        newRecordNumbers.set(todo.id, index + 1);
      });
      setRecordNumbers(newRecordNumbers);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      createdAt: new Date().toISOString(), // Convert to ISO string before sending
    };

    try {
      console.log("Adding todo:", todo);
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todo),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status}, details: ${
            errorData.details || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      // Convert the ISO date strings back to Date objects
      const todosWithDates = data.map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt),
      }));
      setTodos(todosWithDates);
      setNewTodo("");
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to add todo:", error);
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    try {
      await fetch("/api/todos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: !todo.completed }),
      });
      await fetchTodos();
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await fetch("/api/todos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await fetchTodos();
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = async (id: string) => {
    if (!editText.trim()) return;
    try {
      await fetch("/api/todos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, text: editText.trim() }),
      });
      await fetchTodos();
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
    setEditingId(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "newest" ? "oldest" : "newest");
    setCurrentPage(1); // Reset to first page when changing sort order
  };

  // Sort and pagination logic
  const filteredTodos = todos.filter((todo) => {
    if (filter === "completed") return todo.completed;
    if (filter === "pending") return !todo.completed;
    return true;
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(sortedTodos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTodos = sortedTodos.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Todo App
        </h1>

        <form onSubmit={addTodo} className="mb-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="newTodo" className="text-gray-700 font-medium">
              Add New Todo
            </label>
            <div className="flex gap-2">
              <input
                id="newTodo"
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Enter a new todo"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add
              </button>
            </div>
          </div>
        </form>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <label className="text-gray-700 font-medium">Todo List</label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFilter("all");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-sm ${
                  filter === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setFilter("completed");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-sm ${
                  filter === "completed"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => {
                  setFilter("pending");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-sm ${
                  filter === "pending"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Pending
              </button>
            </div>
          </div>
          <button
            onClick={toggleSortOrder}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Sort by: {sortOrder === "newest" ? "Newest First" : "Oldest First"}
          </button>
        </div>

        <ul className="space-y-3 mb-4">
          {currentTodos.map((todo, index) => (
            <li
              key={todo.id}
              className={`flex flex-col p-4 bg-gray-50 rounded-lg shadow-sm border-2 ${
                todo.completed ? "border-gray-300" : "border-green-500"
              }`}
            >
              {editingId === todo.id ? (
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 w-16">
                      Info {recordNumbers.get(todo.id)}:
                    </span>
                    <input
                      id={`edit-${todo.id}`}
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 w-16">
                      Info {recordNumbers.get(todo.id)}:
                    </span>
                    <p
                      className={`text-lg ${
                        todo.completed
                          ? "line-through text-gray-500"
                          : "text-gray-800"
                      }`}
                    >
                      {todo.text}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span
                    className={`text-sm ${
                      todo.completed ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {todo.completed ? "Completed" : "Pending"}
                  </span>
                </div>

                <div className="flex gap-2">
                  {editingId === todo.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(todo.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(todo)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-2 pt-2 border-t border-gray-200">
                <div>
                  <span className="font-medium">ID:</span>
                  <span className="ml-1 font-mono">{todo.id}</span>
                </div>
                <div>
                  <span className="font-medium">Created:</span>
                  <span className="ml-1">
                    {new Date(todo.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Pagination controls */}
        {todos.length > 0 && (
          <div className="flex items-center justify-between border-t pt-4">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md ${
                currentPage === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
