import { prisma } from "@/lib/prisma";
import { TodoCategory, Priority, Status } from "@prisma/client";
import type { SortField, SortOrder } from "@/components/SortFilter";
import type { Metadata } from 'next';
import { TodoPage } from "@/components/TodoPage";

const ITEMS_PER_PAGE = 3;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Todo App',
    description: 'A simple todo app with advanced features',
  };
}

export default async function Page({
  searchParams = {},
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const selectedCategory = ((searchParams.category as string) || 'All') as TodoCategory | 'All';
  const selectedPriority = ((searchParams.priority as string) || 'All') as Priority | 'All';
  const selectedStatus = ((searchParams.status as string) || 'All') as Status | 'All';
  const currentPage = Number(searchParams.page) || 1;
  const sortField = ((searchParams.sortField as string) || 'createdAt') as SortField;
  const sortOrder = ((searchParams.sortOrder as string) || 'desc') as SortOrder;

  // Get total count for pagination
  const totalCount = await prisma.todo.count({
    where: {
      AND: [
        selectedCategory === 'All' ? {} : {
          category: selectedCategory as TodoCategory,
        },
        selectedPriority === 'All' ? {} : {
          priority: selectedPriority as Priority,
        },
        selectedStatus === 'All' ? {} : {
          status: selectedStatus as Status,
        },
      ],
    },
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Get paginated todos
  const todos = await prisma.todo.findMany({
    where: {
      AND: [
        selectedCategory === 'All' ? {} : {
          category: selectedCategory as TodoCategory,
        },
        selectedPriority === 'All' ? {} : {
          priority: selectedPriority as Priority,
        },
        selectedStatus === 'All' ? {} : {
          status: selectedStatus as Status,
        },
      ],
    },
    orderBy: {
      [sortField]: sortOrder,
    },
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  });

  // Serialize searchParams
  const serializedSearchParams = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value
    ])
  );

  return (
    <TodoPage
      todos={todos}
      totalCount={totalCount}
      totalPages={totalPages}
      currentPage={currentPage}
      selectedCategory={selectedCategory}
      selectedPriority={selectedPriority}
      selectedStatus={selectedStatus}
      sortField={sortField}
      sortOrder={sortOrder}
      searchParams={serializedSearchParams}
    />
  );
}
