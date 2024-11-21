'use client';

import { TodoCategory, Priority, Status } from "@prisma/client";
import { useState, useRef, useEffect } from "react";

interface Todo {
  id: string;
  title: string;
  description: string | null;
  category: TodoCategory;
  priority: Priority;
  status: Status;
  dueDate: string | null;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TodoFormProps {
  todo: Todo;
  onSubmit: (formData: FormData) => Promise<void>;
  showColorPicker: boolean;
  setShowColorPicker: (show: boolean) => void;
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
  showColorPicker,
  setShowColorPicker,
}: TodoFormProps) {
  const [error, setError] = useState("");
  const [currentColor, setCurrentColor] = useState<string | null>(todo.color);
  const titleRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(todo.title);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.innerHTML = title;
    }
  }, [title]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    
    // Get all form elements
    const form = e.currentTarget;
    const formElements = form.elements as HTMLFormControlsCollection;
    
    // Add form fields to FormData
    formData.append('title', titleRef.current?.textContent || '');
    formData.append('description', (formElements.namedItem('description') as HTMLTextAreaElement).value);
    formData.append('category', (formElements.namedItem('category') as HTMLSelectElement).value);
    formData.append('priority', (formElements.namedItem('priority') as HTMLSelectElement).value);
    formData.append('status', (formElements.namedItem('status') as HTMLSelectElement).value);
    formData.append('dueDate', (formElements.namedItem('dueDate') as HTMLInputElement).value);
    formData.append('color', currentColor || '');
    
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
      setShowColorPicker(false);
    } else {
      // If no text is selected, set the color for future typing
      setCurrentColor(color);
      setShowColorPicker(false);
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
          onInput={(e) => e.currentTarget.textContent && setTitle(e.currentTarget.textContent)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          dangerouslySetInnerHTML={{ __html: title }}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          rows={4}
          defaultValue={todo.description || ""}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          <option value="Event">Event</option>
          <option value="Reminder">Reminder</option>
          <option value="Someday">Someday</option>
          <option value="Now">Now</option>
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
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
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
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Complete">Complete</option>
          <option value="Forget">Forget</option>
          <option value="OnHold">On Hold</option>
        </select>
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
          Due Date
        </label>
        <input
          type="date"
          name="dueDate"
          id="dueDate"
          defaultValue={todo.dueDate || undefined}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Text Color</label>
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
          >
            {showColorPicker ? "Hide Colors" : "Show Colors"}
          </button>
          {currentColor && (
            <div
              className="w-6 h-6 rounded-full border border-gray-300"
              style={{ backgroundColor: currentColor }}
            />
          )}
        </div>
        {showColorPicker && (
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
            <button
              type="button"
              onClick={() => {
                setCurrentColor(null);
                setShowColorPicker(false);
                if (titleRef.current) {
                  titleRef.current.style.color = '';
                }
              }}
              className="w-8 h-8 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
              title="Reset color"
            >
              ✕
            </button>
          </div>
        )}
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
          className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
