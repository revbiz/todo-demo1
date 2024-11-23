import { prisma } from "@/lib/prisma";
import { TodoCategory, Priority, Status } from "@prisma/client";
import type { SortField, SortOrder } from "@/components/SortFilter";
import type { Metadata } from "next";
import TodoPage from "@/components/TodoPage";
import { Pagination } from "@/components/Pagination";
import Link from "next/link";
import { CategoryFilter } from "@/components/CategoryFilter";
import { PriorityFilter } from "@/components/PriorityFilter";
import { StatusFilter } from "@/components/StatusFilter";

// Disable all caching for this page
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "View All Todos - Todo App PG",
  description: "View all todos in the todo app",
};

interface PageProps {
  searchParams: {
    page?: string;
    category?: TodoCategory | "All";
    priority?: Priority | "All";
    status?: Status | "All";
    sortBy?: SortField;
    sortOrder?: SortOrder;
    timeFilter?: "today" | "7days" | "30days" | "all";
    search?: string;
  };
}

export default async function ViewAllPage({ searchParams }: PageProps) {
  const currentPage = Number(searchParams.page) || 1;
  const selectedCategory = (searchParams.category as TodoCategory | "All") || "All";
  const selectedPriority = (searchParams.priority as Priority | "All") || "All";
  const selectedStatus = (searchParams.status as Status | "All") || "All";
  const timeFilter = searchParams.timeFilter || "all";
  const searchQuery = searchParams.search || "";
  const sortBy = searchParams.sortBy || "createdAt";
  const sortOrder = searchParams.sortOrder || "desc";
  const itemsPerPage = 10;
  const skip = (currentPage - 1) * itemsPerPage;

  // Calculate dates for filters
  const today = new Date();
  today.setHours(0, 0, 0, 0);  // Start of today

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const where = {
    ...(selectedCategory !== "All" && { category: selectedCategory }),
    ...(selectedPriority !== "All" && { priority: selectedPriority }),
    ...(selectedStatus !== "All" && { status: selectedStatus }),
    ...(timeFilter === "today" && {
      createdAt: {
        gte: today
      }
    }),
    ...(timeFilter === "7days" && {
      createdAt: {
        gte: sevenDaysAgo
      }
    }),
    ...(timeFilter === "30days" && {
      createdAt: {
        gte: thirtyDaysAgo
      }
    }),
    ...(searchQuery && {
      OR: [
        {
          title: {
            contains: searchQuery,
            mode: 'insensitive' as const
          }
        },
        {
          content: {
            contains: searchQuery,
            mode: 'insensitive' as const
          }
        }
      ]
    }),
  };

  const [todos, totalCount, totalUnfilteredCount] = await Promise.all([
    prisma.todo.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: itemsPerPage,
    }),
    prisma.todo.count({ where }),
    prisma.todo.count(), // Get total count without any filters
  ]);

  // Check if any filters are active
  const hasActiveFilters = 
    selectedCategory !== "All" || 
    selectedPriority !== "All" || 
    selectedStatus !== "All" || 
    timeFilter !== "all" ||
    searchQuery !== "";

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Function to generate URL with updated time filter
  const getTimeFilterUrl = (filter: "today" | "7days" | "30days" | "all") => {
    const params = new URLSearchParams();
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    if (selectedPriority !== "All") params.set("priority", selectedPriority);
    if (selectedStatus !== "All") params.set("status", selectedStatus);
    if (sortBy !== "createdAt") params.set("sortBy", sortBy);
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder);
    if (filter !== "all") params.set("timeFilter", filter);
    if (searchQuery) params.set("search", searchQuery);
    return `/viewall?${params.toString()}`;
  };

  return (
    <main className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">All Todos</h1>
        <div className="flex gap-4">
          <Link
            href="/"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Home
          </Link>
        </div>
      </div>
      <header className="flex flex-col gap-3 mb-3">
        <div>
          <h1 className="text-2xl font-bold">
            {!hasActiveFilters ? (
              `All Todos (${totalUnfilteredCount})`
            ) : (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span>{totalCount} of {totalUnfilteredCount} todos</span>
                  {timeFilter !== "all" && (
                    <span className="text-lg font-normal text-gray-600">
                      ({timeFilter === "today" ? "Today Only" : 
                        timeFilter === "7days" ? "Last 7 Days" : 
                        "Last 30 Days"})
                    </span>
                  )}
                  {searchQuery && (
                    <span className="text-lg font-normal text-gray-600">
                      (Search: "{searchQuery}")
                    </span>
                  )}
                </div>
              </div>
            )}
          </h1>
        </div>
        <nav className="flex gap-2">
          <Link
            href="/"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/add"
            className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
          >
            Add Todo
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/todotable"
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Todo Table
          </Link>
        </nav>
      </header>

      <div className="mb-4">
        <form action="/viewall" method="GET" className="flex gap-2">
          <input
            type="text"
            name="search"
            placeholder="Search in title or content..."
            defaultValue={searchQuery}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Search
          </button>
          {searchQuery && (
            <Link
              href={`/viewall${timeFilter !== "all" ? `?timeFilter=${timeFilter}` : ''}`}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Clear Search
            </Link>
          )}
        </form>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <CategoryFilter selected={selectedCategory} />
        <PriorityFilter selected={selectedPriority} />
        <StatusFilter selected={selectedStatus} />
        <div className="flex gap-2">
          <Link
            href={getTimeFilterUrl("today")}
            className={`px-4 py-2 rounded-md transition-colors ${
              timeFilter === "today"
                ? "bg-orange-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Today
          </Link>
          <Link
            href={getTimeFilterUrl("7days")}
            className={`px-4 py-2 rounded-md transition-colors ${
              timeFilter === "7days"
                ? "bg-orange-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Last 7 Days
          </Link>
          <Link
            href={getTimeFilterUrl("30days")}
            className={`px-4 py-2 rounded-md transition-colors ${
              timeFilter === "30days"
                ? "bg-orange-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Last 30 Days
          </Link>
          <Link
            href={getTimeFilterUrl("all")}
            className={`px-4 py-2 rounded-md transition-colors ${
              timeFilter === "all"
                ? "bg-orange-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            All Time
          </Link>
        </div>
      </div>

      <TodoPage todos={todos} />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl="/viewall"
          searchParams={searchParams}
        />
      )}
    </main>
  );
}
