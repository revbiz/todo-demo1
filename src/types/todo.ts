import { TodoCategory, Priority, Status } from '@prisma/client';

export type { TodoCategory, Priority, Status };

export interface Todo {
  id: string;
  title: string;
  content?: string | null;
  completed: boolean;
  category: TodoCategory;
  priority: Priority;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}
