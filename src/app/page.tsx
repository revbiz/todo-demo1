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

// Default values for parameters
const defaultParams = {
  category: 'All',
  priority: 'All',
  status: 'All',
  page: '1',
  sortField: 'createdAt',
  sortOrder: 'desc'
} as const;

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Await and destructure searchParams with defaults
  const params = await searchParams;
  const {
    category = defaultParams.category,
    priority = defaultParams.priority,
    status = defaultParams.status,
    page = defaultParams.page,
    sortField = defaultParams.sortField,
    sortOrder = defaultParams.sortOrder,
  } = params;

  // Convert values with proper typing
  const selectedCategory = (Array.isArray(category) ? category[0] : category) as TodoCategory | 'All';
  const selectedPriority = (Array.isArray(priority) ? priority[0] : priority) as Priority | 'All';
  const selectedStatus = (Array.isArray(status) ? status[0] : status) as Status | 'All';
  const currentPage = Number(Array.isArray(page) ? page[0] : page) || 1;
  const selectedSortField = (Array.isArray(sortField) ? sortField[0] : sortField) as SortField;
  const selectedSortOrder = (Array.isArray(sortOrder) ? sortOrder[0] : sortOrder) as SortOrder;

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
      [selectedSortField]: selectedSortOrder,
    },
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  });

  // Create a simplified searchParams object for the client
  const serializedSearchParams: { [key: string]: string } = {
    category: selectedCategory,
    priority: selectedPriority,
    status: selectedStatus,
    page: String(currentPage),
    sortField: selectedSortField,
    sortOrder: selectedSortOrder
  };

  return (
    <TodoPage
      todos={todos}
      totalCount={totalCount}
      totalPages={totalPages}
      currentPage={currentPage}
      selectedCategory={selectedCategory}
      selectedPriority={selectedPriority}
      selectedStatus={selectedStatus}
      sortField={selectedSortField}
      sortOrder={selectedSortOrder}
      searchParams={serializedSearchParams}
    />
  );
}
