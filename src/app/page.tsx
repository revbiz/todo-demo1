"use server";

import { prisma } from "@/lib/prisma";
import { TodoCategory, Priority, Status } from "@prisma/client";
import Link from "next/link";
import { TodoList } from "@/components/TodoList";
import { CategoryFilter } from "@/components/CategoryFilter";
import { PriorityFilter } from "@/components/PriorityFilter";
import { StatusFilter } from "@/components/StatusFilter";
import { SortFilter, type SortField, type SortOrder } from "@/components/SortFilter";

const ITEMS_PER_PAGE = 3;

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const selectedCategory = (searchParams.category as TodoCategory) || 'All';
  const selectedPriority = (searchParams.priority as Priority) || 'All';
  const selectedStatus = (searchParams.status as Status) || 'All';
  const currentPage = Number(searchParams.page) || 1;
  const sortField = (searchParams.sortField as SortField) || 'createdAt';
  const sortOrder = (searchParams.sortOrder as SortOrder) || 'desc';

  // Get total count for pagination
  const totalCount = await prisma.todo.count({
    where: {
      AND: [
        selectedCategory !== 'All' ? {
          category: selectedCategory as TodoCategory,
        } : {},
        selectedPriority !== 'All' ? {
          priority: selectedPriority as Priority,
        } : {},
        selectedStatus !== 'All' ? {
          status: selectedStatus as Status,
        } : {},
      ],
    },
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Get paginated todos
  const todos = await prisma.todo.findMany({
    where: {
      AND: [
        selectedCategory !== 'All' ? {
          category: selectedCategory as TodoCategory,
        } : {},
        selectedPriority !== 'All' ? {
          priority: selectedPriority as Priority,
        } : {},
        selectedStatus !== 'All' ? {
          status: selectedStatus as Status,
        } : {},
      ],
    },
    orderBy: {
      [sortField]: sortOrder,
    },
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  });

  // Create pagination URLs
  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams();
    
    // Preserve all current search parameters
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') {
        params.set(key, value.toString());
      }
    });
    
    // Always set the page parameter
    params.set('page', pageNumber.toString());
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Todo List</h1>
          <Link
            href="/add"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add New Todo
          </Link>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-4 bg-white p-4 rounded-lg shadow">
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-2">Category</h2>
              <CategoryFilter selectedCategory={selectedCategory} />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-2">Priority</h2>
              <PriorityFilter selectedPriority={selectedPriority} />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-2">Status</h2>
              <StatusFilter selectedStatus={selectedStatus} />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-2">Sort By</h2>
              <SortFilter selectedSortField={sortField} selectedSortOrder={sortOrder} />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <TodoList 
            todos={todos} 
            selectedCategory={selectedCategory} 
            selectedPriority={selectedPriority}
            selectedStatus={selectedStatus}
            currentPage={currentPage}
            totalCount={totalCount}
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {currentPage > 1 && (
              <Link
                href={createPageURL(currentPage - 1)}
                className="px-4 py-2 text-sm bg-white text-blue-500 rounded-md hover:bg-blue-50 border border-blue-200"
              >
                Previous
              </Link>
            )}
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <Link
                  key={pageNumber}
                  href={createPageURL(pageNumber)}
                  className={`px-4 py-2 text-sm rounded-md ${
                    pageNumber === currentPage
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-blue-500 hover:bg-blue-50 border border-blue-200'
                  }`}
                >
                  {pageNumber}
                </Link>
              ))}
            </div>

            {currentPage < totalPages && (
              <Link
                href={createPageURL(currentPage + 1)}
                className="px-4 py-2 text-sm bg-white text-blue-500 rounded-md hover:bg-blue-50 border border-blue-200"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
