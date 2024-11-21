"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TodoCategory, Priority, Status } from "@prisma/client";
import RichTextEditor from "@/components/RichTextEditor";
import Link from "next/link";

interface EditPageProps {
  params: {
    id: string;
  };
}

interface Todo {
  id: string;
  title: string;
  content: string | null;
  category: TodoCategory;
  priority: Priority;
  status: Status;
  dueDate: string | null;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

const CATEGORIES = Object.values(TodoCategory);
const PRIORITIES = Object.values(Priority);
const STATUSES = Object.values(Status);

export default function EditPage({ params }: EditPageProps) {
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
        const response = await fetch(`/api/todos/${todoId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch todo");
        }
        const data = await response.json();
        if (!data) {
          throw new Error("Todo not found");
        }
        setTodo(data);
        setTitle(data.title);
        setContent(data.content || "");
        setCategory(data.category);
        setPriority(data.priority);
        setStatus(data.status);
        setDueDate(data.dueDate || "");
        setUrl(data.url || "");
      } catch (err) {
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

    try {
      // Validate and clean URL
      let cleanedUrl = url ? url.trim() : "";
      if (cleanedUrl && !cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
        cleanedUrl = `https://${cleanedUrl}`;
      }

      const data = {
        id: todoId,
        title,
        content: content || "",
        category,
        priority,
        status,
        dueDate: dueDate || null,
        url: cleanedUrl,
      };

      const response = await fetch(`/api/todos/${todoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update todo");
      }

      // Force revalidation of both home page and todo page
      await Promise.all([
        fetch('/api/revalidate?path=/', { cache: 'no-store' }),
        fetch(`/api/revalidate?path=/view/${todoId}?page=true`, { cache: 'no-store' }),
      ]);
      
      // Wait a moment for revalidation to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      router.push("/");
      router.refresh();

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update todo");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!todo) {
    return <div className="p-4">Todo not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Todo</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <RichTextEditor
            initialContent={title}
            onUpdate={setTitle}
            placeholder="Enter todo title..."
            minHeight="2.5rem"
          />
        </div>

        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            Content
          </label>
          <RichTextEditor
            initialContent={content}
            onUpdate={setContent}
            placeholder="Enter todo content..."
            minHeight="10rem"
          />
        </div>

        <div>
          <label
            htmlFor="url"
            className="block text-sm font-medium text-gray-700"
          >
            URL (optional)
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as TodoCategory)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-700"
          >
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {PRIORITIES.map((pri) => (
              <option key={pri} value={pri}>
                {pri.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700"
          >
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {STATUSES.map((stat) => (
              <option key={stat} value={stat}>
                {stat.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="dueDate"
            className="block text-sm font-medium text-gray-700"
          >
            Due Date (optional)
          </label>
          <input
            type="datetime-local"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
          <Link
            href="/"
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
