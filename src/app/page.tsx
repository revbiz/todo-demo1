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
  title: "Todo App PG",
  description: "A simple todo app using Next.js and PostgreSQL",
};

interface PageProps {
  searchParams: {
    page?: string;
    category?: TodoCategory | "All";
    priority?: Priority | "All";
    status?: Status | "All";
    sortBy?: SortField;
    sortOrder?: SortOrder;
  };
}

export default async function Page({ searchParams }: PageProps) {
  const currentPage = Number(searchParams.page) || 1;
  const selectedCategory = (searchParams.category as TodoCategory | "All") || "All";
  const selectedPriority = (searchParams.priority as Priority | "All") || "All";
  const selectedStatus = (searchParams.status as Status | "All") || "All";
  const sortBy = searchParams.sortBy || "createdAt";
  const sortOrder = searchParams.sortOrder || "desc";
  const itemsPerPage = 10;
  const skip = (currentPage - 1) * itemsPerPage;

  const where = {
    ...(selectedCategory !== "All" && { category: selectedCategory }),
    ...(selectedPriority !== "All" && { priority: selectedPriority }),
    ...(selectedStatus !== "All" && { status: selectedStatus }),
  };

  const [todos, totalCount] = await Promise.all([
    prisma.todo.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: itemsPerPage,
    }),
    prisma.todo.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <main className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Todos</h1>
        <div className="flex gap-4">
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <h1 className="text-2xl font-bold">Todos PG ({totalCount})</h1>
        <div className="flex gap-2">
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
            href="/viewall"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            View All
          </Link>
          <Link
            href="/todotable"
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Todo Table
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <CategoryFilter selected={selectedCategory} />
        <PriorityFilter selected={selectedPriority} />
        <StatusFilter selected={selectedStatus} />
      </div>

      <TodoPage todos={todos} />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl="/"
          searchParams={searchParams}
        />
      )}
    </main>
  );
}
