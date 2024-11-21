'use client';

import { TodoCategory, Priority, Status } from "@prisma/client";
import Link from "next/link";
import { TodoList } from "@/components/TodoList";
import { CategoryFilter } from "@/components/CategoryFilter";
import { PriorityFilter } from "@/components/PriorityFilter";
import { StatusFilter } from "@/components/StatusFilter";
import { SortFilter, type SortField, type SortOrder } from "@/components/SortFilter";
import { ReactNode } from "react";

interface TodoPageProps {
  todos: any[];
  totalCount: number;
  totalPages: number;
  selectedCategory: TodoCategory | 'All';
  selectedPriority: Priority | 'All';
  selectedStatus: Status | 'All';
  sortField: SortField;
  sortOrder: SortOrder;
  searchParams: { [key: string]: string | undefined };
  children?: ReactNode;
}

export function TodoPage({
  todos,
  totalCount,
  totalPages,
  selectedCategory,
  selectedPriority,
  selectedStatus,
  sortField,
  sortOrder,
  searchParams,
  children
}: TodoPageProps) {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Todo List</h1>
        <Link
          href="/add"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Add Todo
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
            currentPage={1}
            totalCount={totalCount}
          />

          {children}
        </div>
      </div>
    </main>
  );
}
