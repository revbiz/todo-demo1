import { Status, TodoCategory, Priority } from "@prisma/client";

export type Todo = {
  id: string;
  title: string;
  content: string | null;
  status: Status;
  category: TodoCategory;
  priority: Priority;
  url: string | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export { Status, TodoCategory, Priority };
