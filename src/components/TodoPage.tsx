"use client";

import { TodoCategory, Priority, Status } from "@prisma/client";
import Link from "next/link";
import { TodoList } from "@/components/TodoList";
import { CategoryFilter } from "@/components/CategoryFilter";
import { PriorityFilter } from "@/components/PriorityFilter";
import { StatusFilter } from "@/components/StatusFilter";
import { ReactNode } from "react";

interface TodoPageProps {
  todos: any[];
  selectedCategory: TodoCategory | "All";
  selectedPriority: Priority | "All";
  selectedStatus: Status | "All";
  currentPage: number;
  totalCount: number;
}

export function TodoPage({
  todos,
  selectedCategory,
  selectedPriority,
  selectedStatus,
  currentPage,
  totalCount,
}: TodoPageProps) {
  return (
    <main className="container mx-auto px-1">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-2xl font-bold">Todos PG ({totalCount})</h1>
        <Link
          href="/add"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1.5 px-3 rounded"
        >
          Add Todo
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <CategoryFilter selected={selectedCategory} />
        <PriorityFilter selected={selectedPriority} />
        <StatusFilter selected={selectedStatus} />
      </div>

      <TodoList
        todos={todos}
        selectedCategory={selectedCategory}
        selectedPriority={selectedPriority}
        selectedStatus={selectedStatus}
        currentPage={currentPage}
        totalCount={totalCount}
      />
    </main>
  );
}
