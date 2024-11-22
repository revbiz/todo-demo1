'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { Priority, Status, TodoCategory } from "@prisma/client";
import RichTextEditor from "@/components/RichTextEditor";

interface Todo {
  id: string;
  title: string;
  content: string | null;
  category: TodoCategory;
  priority: Priority;
  status: Status;
  dueDate: string | null;
  url: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function EditTodo({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const todoId = params.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [todo, setTodo] = useState<Todo | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<TodoCategory>(TodoCategory.PERSONAL);
  const [priority, setPriority] = useState<Priority>(Priority.LOW);
  const [status, setStatus] = useState<Status>(Status.PENDING);
  const [dueDate, setDueDate] = useState("");
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTodo = async () => {
      try {
        console.log('Fetching todo:', todoId);
        const response = await fetch(`/api/todos/${todoId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch todo");
        }
        const data = await response.json();
        console.log('API Response:', data);
        if (!data) {
          throw new Error("Todo not found");
        }
        
        // Store the raw HTML content
        const rawTitle = data.title;
        const rawContent = data.content;
        console.log('Raw HTML content:', { rawTitle, rawContent });
        
        setTodo(data);
        setTitle(rawTitle || "");
        setContent(rawContent || "");
        setCategory(data.category);
        setPriority(data.priority);
        setStatus(data.status);
        setDueDate(data.dueDate || "");
        setUrl(data.url || "");
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTodo();
  }, [todoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!title.replace(/<[^>]*>/g, '').trim()) {
      setError("Please enter a title for your todo");
      setIsSubmitting(false);
      return;
    }

    try {
      const data = {
        title,
        content,
        category,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        url: url.trim() || null,
      };

      const response = await fetch(`/api/todos/${todoId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update todo");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Edit Todo</h1>
        <div className="space-x-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/"
            className="inline-block px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <RichTextEditor
          initialContent={title}
          onUpdate={(newContent) => setTitle(newContent)}
          placeholder="Enter todo title..."
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <RichTextEditor
          initialContent={content}
          onUpdate={(newContent) => setContent(newContent)}
          placeholder="Enter todo content..."
        />
      </div>

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700">
          URL (optional)
        </label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="https://example.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as TodoCategory)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {Object.values(TodoCategory).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {Object.values(Priority).map((pri) => (
              <option key={pri} value={pri}>
                {pri}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {Object.values(Status).map((stat) => (
              <option key={stat} value={stat}>
                {stat.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
            Due Date (optional)
          </label>
          <input
            type="date"
            id="dueDate"
            value={dueDate ? new Date(dueDate).toISOString().split('T')[0] : ''}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </form>
  );
}
