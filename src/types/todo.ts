export type TodoCategory = 'Event' | 'Reminder' | 'Someday' | 'Now';

export interface Todo {
  id: string;
  title: string;
  content?: string | null;
  completed: boolean;
  category: TodoCategory;
  createdAt: Date;
  updatedAt: Date;
}
