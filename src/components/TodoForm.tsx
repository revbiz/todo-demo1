'use client';

import { TodoCategory, Priority, Status } from "@prisma/client";
import { useState, useRef, useEffect } from "react";
import DOMPurify from 'isomorphic-dompurify';

interface Todo {
  id?: string;
  title: string;
  content: string | null;
  url?: string | null;
  category: TodoCategory;
  priority: Priority;
  status: Status;
  dueDate?: Date | null;
}

interface TodoFormProps {
  todo: Todo;
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
}

const COLORS = [
  "#000000", // black
  "#EF4444", // red
  "#22C55E", // green
  "#3B82F6", // blue
  "#F59E0B", // yellow
  "#8B5CF6", // purple
];

export function TodoForm({
  todo,
  onSubmit,
  isSubmitting,
}: TodoFormProps) {
  const [error, setError] = useState("");
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.innerHTML = DOMPurify.sanitize(todo.title);
    }
  }, [todo.title]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    
    // Get all form elements
    const form = e.currentTarget;
    const formElements = form.elements as HTMLFormControlsCollection;
    
    // Add form fields to FormData
    formData.append('id', todo.id || '');
    formData.append('title', titleRef.current?.innerHTML || '');
    formData.append('content', (formElements.namedItem('content') as HTMLTextAreaElement).value);
    formData.append('url', (formElements.namedItem('url') as HTMLInputElement).value);
    formData.append('category', (formElements.namedItem('category') as HTMLSelectElement).value);
    formData.append('priority', (formElements.namedItem('priority') as HTMLSelectElement).value);
    formData.append('status', (formElements.namedItem('status') as HTMLSelectElement).value);
    formData.append('dueDate', (formElements.namedItem('dueDate') as HTMLInputElement).value);
    
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit form");
    }
  };

  const handleColorClick = (color: string) => {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    
    if (range && !range.collapsed && titleRef.current?.contains(range.commonAncestorContainer)) {
      const span = document.createElement('span');
      span.style.color = color;
      range.surroundContents(span);
    } else {
      // If no text is selected, set the color for future typing
      setCurrentColor(color);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <div
          ref={titleRef}
          contentEditable
          role="textbox"
          aria-label="Title"
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 min-h-[2.5rem]"
          style={currentColor ? { color: currentColor } : undefined}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <textarea
          name="content"
          id="content"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          defaultValue={todo.content || ""}
          rows={4}
        />
      </div>

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700">
          URL
        </label>
        <input
          type="url"
          name="url"
          id="url"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          defaultValue={todo.url || ""}
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          name="category"
          id="category"
          defaultValue={todo.category}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {Object.values(TodoCategory).map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
          Priority
        </label>
        <select
          name="priority"
          id="priority"
          defaultValue={todo.priority}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {Object.values(Priority).map((pri) => (
            <option key={pri} value={pri}>{pri}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          name="status"
          id="status"
          defaultValue={todo.status}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {Object.values(Status).map((stat) => (
            <option key={stat} value={stat}>{stat}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
          Due Date
        </label>
        <input
          type="datetime-local"
          name="dueDate"
          id="dueDate"
          defaultValue={todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 16) : undefined}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Text Color</label>
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentColor(null)}
            className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
          >
            Reset Colors
          </button>
          {currentColor && (
            <div
              className="w-6 h-6 rounded-full border border-gray-300"
              style={{ backgroundColor: currentColor }}
            />
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleColorClick(color)}
              className="w-8 h-8 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              style={{ backgroundColor: color }}
              title={`Set text color to ${color}`}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
