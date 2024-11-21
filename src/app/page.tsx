import { prisma } from "@/lib/prisma";
import { TodoCategory, Priority, Status } from "@prisma/client";
import type { SortField, SortOrder } from "@/components/SortFilter";
import type { Metadata } from "next";
import { TodoPage } from "@/components/TodoPage";
import { Pagination } from "@/components/Pagination";

// Disable all caching for this page
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

const ITEMS_PER_PAGE = 3;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Todo App",
    description: "A simple todo app with advanced features",
  };
}

const defaultParams = {
  category: "All",
  priority: "All",
  status: "All",
  page: "1",
  sortField: "createdAt",
  sortOrder: "desc",
} as const;

interface PageProps {
  params: { [key: string]: string | string[] };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Page({ searchParams = {} }: PageProps) {
  const {
    category = defaultParams.category,
    priority = defaultParams.priority,
    status = defaultParams.status,
    page = defaultParams.page,
    sortField = defaultParams.sortField,
    sortOrder = defaultParams.sortOrder,
    searchQuery,
  } = searchParams;

  // Convert values with proper typing
  const selectedCategory = (
    Array.isArray(category) ? category[0] : category
  ) as TodoCategory | "All";
  const selectedPriority = (
    Array.isArray(priority) ? priority[0] : priority
  ) as Priority | "All";
  const selectedStatus = (Array.isArray(status) ? status[0] : status) as
    | Status
    | "All";
  const selectedSortField = (
    Array.isArray(sortField) ? sortField[0] : sortField
  ) as SortField;
  const selectedSortOrder = (
    Array.isArray(sortOrder) ? sortOrder[0] : sortOrder
  ) as SortOrder;
  const currentPage = Math.max(
    1,
    parseInt(Array.isArray(page) ? page[0] : page, 10)
  );
  const searchQueryString = Array.isArray(searchQuery)
    ? searchQuery[0]
    : (searchQuery as string | undefined);

  // Get total count for pagination
  const totalCount = await prisma.todo.count({
    where: {
      AND: [
        selectedCategory === "All"
          ? {}
          : {
              category: selectedCategory as TodoCategory,
            },
        selectedPriority === "All"
          ? {}
          : {
              priority: selectedPriority as Priority,
            },
        selectedStatus === "All"
          ? {}
          : {
              status: selectedStatus as Status,
            },
        searchQueryString
          ? {
              OR: [
                { title: { mode: "insensitive", contains: searchQueryString } },
                {
                  content: { mode: "insensitive", contains: searchQueryString },
                },
              ],
            }
          : {},
      ],
    },
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Get paginated todos
  const todos = await prisma.todo.findMany({
    where: {
      AND: [
        selectedCategory === "All"
          ? {}
          : {
              category: selectedCategory as TodoCategory,
            },
        selectedPriority === "All"
          ? {}
          : {
              priority: selectedPriority as Priority,
            },
        selectedStatus === "All"
          ? {}
          : {
              status: selectedStatus as Status,
            },
        searchQueryString
          ? {
              OR: [
                { title: { mode: "insensitive", contains: searchQueryString } },
                {
                  content: { mode: "insensitive", contains: searchQueryString },
                },
              ],
            }
          : {},
      ],
    },
    orderBy: {
      [selectedSortField]: selectedSortOrder,
    },
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <TodoPage
        todos={todos}
        selectedCategory={selectedCategory}
        selectedPriority={selectedPriority}
        selectedStatus={selectedStatus}
        currentPage={currentPage}
        totalCount={totalCount}
      />
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
