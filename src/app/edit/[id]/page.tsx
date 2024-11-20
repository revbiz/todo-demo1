"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TodoCategory, Priority, Status } from "@prisma/client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";

const COLORS = [
  "#000000", // black
  "#EF4444", // red
  "#22C55E", // green
  "#3B82F6", // blue
  "#F59E0B", // yellow
  "#8B5CF6", // purple
];

interface Todo {
  id: string;
  title: string;
  content: string | null;
  completed: boolean;
  category: TodoCategory;
  priority: Priority;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export default function EditTodo({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: todoId } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [initialContent, setInitialContent] = useState("");
  const [todo, setTodo] = useState<Todo | null>(null);
  const [category, setCategory] = useState<TodoCategory>('Now');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [status, setStatus] = useState<Status>('Active');

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  // Update editor when initial content is set
  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

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
      const todoData: Todo = await response.json();
      setTodo(todoData);
      setCategory(todoData.category);
      setPriority(todoData.priority);
      setStatus(todoData.status);
      
      // Set the content for the editor
      setInitialContent(todoData.content || todoData.title);
    } catch (error) {
      setError("Failed to fetch todo");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoId || !editor) return;

    try {
      const title = editor.getText().split('\n')[0].trim();
      if (!title) {
        setError("Please enter a title for your todo");
        return;
      }

      const htmlContent = editor.getHTML();

      const response = await fetch("/api/todos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: todoId,
          title: title,
          content: htmlContent,
          category,
          priority,
          status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update todo");
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Failed to update todo:", error);
      setError(error instanceof Error ? error.message : "Failed to update todo");
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

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Edit Todo</h1>
        <div className="space-x-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save
          </button>
          <Link
            href="/"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 inline-block"
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

      <div className="space-y-4">
        {/* Category Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TodoCategory)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Event">Event</option>
            <option value="Reminder">Reminder</option>
            <option value="Someday">Someday</option>
            <option value="Now">Now</option>
          </select>
        </div>

        {/* Priority Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Status Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Complete">Complete</option>
            <option value="Forget">Forget</option>
            <option value="OnHold">On Hold</option>
          </select>
        </div>

        {/* Editor */}
        <div className="border rounded-lg overflow-hidden">
          {/* Rich Text Editor Toolbar */}
          <div className="border-b bg-gray-50 p-2 flex gap-2 flex-wrap items-center">
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`p-2 rounded ${
                editor?.isActive("bold") ? "bg-gray-200" : "hover:bg-gray-200"
              }`}
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`p-2 rounded ${
                editor?.isActive("italic") ? "bg-gray-200" : "hover:bg-gray-200"
              }`}
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded ${
                editor?.isActive("bulletList") ? "bg-gray-200" : "hover:bg-gray-200"
              }`}
            >
              • List
            </button>
          </div>

          {/* Editor Content */}
          <EditorContent editor={editor} />
        </div>
      </div>
    </form>
  );
}
