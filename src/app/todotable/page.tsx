"use client"

import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Download } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Todo, TodoCategory, Priority, Status } from "@/types/todo"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Function to truncate text while preserving words
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  
  // Find the last space within the maxLength
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace === -1) return truncated + '...';
  return truncated.substring(0, lastSpace) + '...';
};

// Function to format and truncate HTML content
const formatAndTruncateContent = (html: string, maxLines: number) => {
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get all paragraph and br elements
  const paragraphs = tempDiv.getElementsByTagName('p');
  
  // Convert paragraphs to text with dashes
  let formattedContent = '';
  let lineCount = 0;
  
  // Process paragraph tags
  if (paragraphs.length > 0) {
    for (let i = 0; i < paragraphs.length && lineCount < maxLines; i++) {
      if (i > 0) {
        formattedContent += ' - ';
      }
      // Truncate each paragraph to 100 characters
      const paragraphText = paragraphs[i].innerHTML;
      formattedContent += truncateText(paragraphText, 100);
      lineCount++;
    }
  } else {
    // If no paragraphs, split by br tags and newlines
    const lines = html
      .split(/<br\s*\/?>/g)
      .flatMap(line => line.split('\n'))
      .filter(line => line.trim())
      .map(line => truncateText(line, 100)); // Truncate each line
    
    formattedContent = lines.slice(0, maxLines).join(' - ');
  }
  
  // Add ellipsis if there were more lines
  if ((paragraphs.length > maxLines) || (!paragraphs.length && html.split(/<br\s*\/?>/g).length > maxLines)) {
    formattedContent += '...';
  }
  
  return formattedContent;
};

// Function to convert todos to CSV
const exportToCSV = (todos: Todo[]) => {
  // Define CSV headers
  const headers = ['Title', 'Content', 'Category', 'Priority', 'Status', 'Created At', 'Updated At']
  
  // Convert todos to CSV rows
  const rows = todos.map(todo => [
    todo.title,
    todo.content || '',
    todo.category,
    todo.priority,
    todo.status,
    new Date(todo.createdAt).toLocaleString(),
    new Date(todo.updatedAt).toLocaleString()
  ].map(field => `"${field}"`).join(','))
  
  // Combine headers and rows
  const csv = [headers.join(','), ...rows].join('\n')
  
  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `todos-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Define the columns for our todo data
const columns: ColumnDef<Todo>[] = [
  {
    id: "actions",
    cell: ({ row }) => {
      const todo = row.original
      return (
        <div className="flex items-center gap-1">
          <Link href={`/view/${todo.id}`}>
            <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors">
              View
            </button>
          </Link>
          <Link href={`/edit/${todo.id}`}>
            <button className="px-3 py-1 bg-emerald-500 text-white text-xs rounded-md hover:bg-emerald-600 transition-colors">
              Edit
            </button>
          </Link>
        </div>
      )
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <button
          className="px-2 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      )
    },
    cell: ({ row }) => {
      const title: string = row.getValue("title")
      const truncatedTitle = formatAndTruncateContent(title, 2) // Show 2 lines max
      return (
        <div 
          className="max-w-[300px]" 
          dangerouslySetInnerHTML={{ __html: truncatedTitle }}
          title={title} // Show full content on hover
        />
      )
    },
  },
  {
    accessorKey: "content",
    header: ({ column }) => {
      return (
        <button
          className="px-2 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Content
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      )
    },
    cell: ({ row }) => {
      const content: string = row.getValue("content")
      if (!content) return null;
      const truncatedContent = formatAndTruncateContent(content, 3) // Show 3 lines max
      return (
        <div className="max-w-md">
          <div 
            className="text-sm text-gray-600" 
            title={content}
            dangerouslySetInnerHTML={{ __html: truncatedContent }} 
          />
        </div>
      )
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category: TodoCategory = row.getValue("category")
      return (
        <Badge variant="outline" className="capitalize">
          {category.toLowerCase().replace('_', ' ')}
        </Badge>
      )
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority: Priority = row.getValue("priority")
      const variant = 
        priority === "HIGH" ? "destructive" :
        priority === "MEDIUM" ? "secondary" :
        "default"
      
      return (
        <Badge variant={variant} className="capitalize">
          {priority.toLowerCase()}
        </Badge>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status: Status = row.getValue("status")
      const variant = 
        status === "COMPLETE" ? "default" :
        status === "PENDING" ? "secondary" :
        status === "ACTIVE" ? "outline" :
        status === "HOLD" ? "secondary" :
        status === "SKIP" ? "destructive" :
        "default"

      return (
        <Badge variant={variant} className="capitalize">
          {status.toLowerCase().replace('_', ' ')}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <button
          className="px-2 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return <div>{date.toLocaleDateString()}</div>
    },
  },
]

export default function TodoTablePage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([])
  const [categoryFilter, setCategoryFilter] = useState<TodoCategory | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all")
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all")

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch("/api/todos")
        const data = await response.json()
        setTodos(data)
        setFilteredTodos(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching todos:", error)
        setLoading(false)
      }
    }

    fetchTodos()
  }, [])

  useEffect(() => {
    let filtered = [...todos]

    if (categoryFilter !== "all") {
      filtered = filtered.filter(todo => todo.category === categoryFilter)
    }
    if (priorityFilter !== "all") {
      filtered = filtered.filter(todo => todo.priority === priorityFilter)
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(todo => todo.status === statusFilter)
    }

    setFilteredTodos(filtered)
  }, [todos, categoryFilter, priorityFilter, statusFilter])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Link href="/">
                <button className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors">
                  Home
                </button>
              </Link>
              <Link href="/viewall">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                  View All
                </button>
              </Link>
              <button
                onClick={() => exportToCSV(filteredTodos)}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Category:</span>
              <Select
                value={categoryFilter}
                onValueChange={(value: TodoCategory | "all") => setCategoryFilter(value)}
              >
                <SelectTrigger className="w-[140px] h-8 bg-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="WORK">Work</SelectItem>
                  <SelectItem value="PERSONAL">Personal</SelectItem>
                  <SelectItem value="SHOPPING">Shopping</SelectItem>
                  <SelectItem value="HEALTH">Health</SelectItem>
                  <SelectItem value="FINANCE">Finance</SelectItem>
                  <SelectItem value="EDUCATION">Education</SelectItem>
                  <SelectItem value="HOME">Home</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Priority:</span>
              <Select
                value={priorityFilter}
                onValueChange={(value: Priority | "all") => setPriorityFilter(value)}
              >
                <SelectTrigger className="w-[140px] h-8 bg-white">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Select
                value={statusFilter}
                onValueChange={(value: Status | "all") => setStatusFilter(value)}
              >
                <SelectTrigger className="w-[140px] h-8 bg-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETE">Complete</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="HOLD">Hold</SelectItem>
                  <SelectItem value="SKIP">Skip</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Total:</span>
            <Badge variant="secondary" className="h-8 px-3 flex items-center">
              {filteredTodos.length} / {todos.length}
            </Badge>
          </div>
        </div>

        <DataTable columns={columns} data={filteredTodos} />
      </div>
    </div>
  )
}
