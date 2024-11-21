"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { Priority, Status, TodoCategory } from "@prisma/client";
import RichTextEditor from "@/components/RichTextEditor";

export default function AddTodo() {
  const router = useRouter();
  const defaultValues = {
    title: "",
    content: "",
    description: "",
    url: "",
    category: TodoCategory.PERSONAL,
    priority: Priority.LOW,
    status: Status.PENDING,
    dueDate: null
  };

  const [category, setCategory] = useState(defaultValues.category);
  const [priority, setPriority] = useState(defaultValues.priority);
  const [status, setStatus] = useState(defaultValues.status);
  const [title, setTitle] = useState(defaultValues.title);
  const [content, setContent] = useState(defaultValues.content);
  const [dueDate, setDueDate] = useState(defaultValues.dueDate);
  const [url, setUrl] = useState(defaultValues.url);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

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
        dueDate: dueDate || null,
        url: url.trim() || null,
      };

      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to save todo');
      }

      const result = await response.json();
      
      if (!result.id) {
        throw new Error('Invalid response from server');
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Add New Todo</h1>
        <div className="space-x-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? 'Adding...' : 'Add Todo'}
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

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <RichTextEditor
          initialContent={title}
          onUpdate={setTitle}
          placeholder="Enter todo title"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <RichTextEditor
          initialContent={content}
          onUpdate={setContent}
          placeholder="Enter todo content"
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
            Due Date
          </label>
          <input
            type="datetime-local"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </form>
  );
}
