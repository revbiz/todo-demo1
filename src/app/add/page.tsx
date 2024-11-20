"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TextStyle from "@tiptap/extension-text-style";
import { Editor } from "@tiptap/core";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import Link from 'next/link';
import type { Priority, Status } from "@prisma/client";

// Define the categories type
const CATEGORIES = ['Event', 'Reminder', 'Someday', 'Now'] as const;
type Category = typeof CATEGORIES[number];

const COLORS = [
  "#000000", // black
  "#FF0000", // red
  "#00FF00", // green
  "#0000FF", // blue
  "#FFFF00", // yellow
  "#FF00FF", // purple
  "#00FFFF", // cyan
];

const PRIORITIES = ["High", "Medium", "Low"] as const;
type TodoPriority = typeof PRIORITIES[number];

const STATUSES = ["Active", "Pending", "Complete", "Forget", "OnHold"] as const;
type TodoStatus = typeof STATUSES[number];

export default function AddTodo() {
  const router = useRouter();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [category, setCategory] = useState<Category>('Now');
  const [priority, setPriority] = useState<TodoPriority>('Medium');
  const [status, setStatus] = useState<TodoStatus>('Active');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[100px] p-2 border border-gray-300 rounded-md [&_ul]:list-disc [&_ul]:pl-5",
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const title = editor?.getText().split('\n')[0].trim();
      if (!title) {
        setError("Please enter a title for your todo");
        setIsSubmitting(false);
        return;
      }

      const htmlContent = editor?.getHTML() || '';

      const data = {
        title: title,
        content: htmlContent || '',
        category: category,
        priority: priority,
        status: status,
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
            {isSubmitting ? 'Saving...' : 'Add Todo'}
          </button>
          <Link
            href="/"
            className={`bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 inline-block ${
              isSubmitting ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            Cancel
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Category Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          disabled={isSubmitting}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Priority Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Priority
        </label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TodoPriority)}
          disabled={isSubmitting}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
        >
          {PRIORITIES.map((pri) => (
            <option key={pri} value={pri}>
              {pri}
            </option>
          ))}
        </select>
      </div>

      {/* Status Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TodoStatus)}
          disabled={isSubmitting}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
        >
          {STATUSES.map((stat) => (
            <option key={stat} value={stat}>
              {stat}
            </option>
          ))}
        </select>
      </div>

      {/* Rich Text Editor */}
      <div className="border rounded-lg overflow-hidden">
        {/* Rich Text Editor Toolbar */}
        <div className="border-b bg-gray-50 p-2 flex gap-2 flex-wrap items-center">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            disabled={isSubmitting}
            className={`p-2 rounded ${
              editor?.isActive("bold") ? "bg-gray-200" : "hover:bg-gray-200"
            } disabled:opacity-50`}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            disabled={isSubmitting}
            className={`p-2 rounded ${
              editor?.isActive("italic") ? "bg-gray-200" : "hover:bg-gray-200"
            } disabled:opacity-50`}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            disabled={isSubmitting}
            className={`p-2 rounded ${
              editor?.isActive("bulletList") ? "bg-gray-200" : "hover:bg-gray-200"
            } disabled:opacity-50`}
          >
            • List
          </button>
          
          {/* Color Picker Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              disabled={isSubmitting}
              className="p-2 rounded hover:bg-gray-200 flex items-center gap-1 disabled:opacity-50"
            >
              <span className="w-4 h-4 border border-gray-300 rounded-full" style={{ 
                background: editor?.getAttributes('textStyle').color || '#000000' 
              }} />
              <span>Color</span>
            </button>
            
            {/* Color Picker Dropdown */}
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded-lg shadow-lg z-10 flex gap-1">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    disabled={isSubmitting}
                    className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform disabled:opacity-50"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      editor?.chain().focus().setColor(color).run();
                      setShowColorPicker(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Editor Content Area */}
        <EditorContent editor={editor} className="min-h-[150px] p-4" />
      </div>
    </form>
  );
}
