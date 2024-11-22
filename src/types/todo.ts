import { TodoCategory, Priority, Status } from '@prisma/client';

export type { TodoCategory, Priority, Status };

export type Todo = {
  id: string;
  title: string;
  content?: string | null;
  url?: string | null;
  category: TodoCategory;
  priority: Priority;
  status: Status;
  dueDate?: Date | null;
  color?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type TodoFormData = {
  title: string;
  content?: string;
  url?: string;
  category: TodoCategory;
  priority: Priority;
  status: Status;
  dueDate?: string;
};
