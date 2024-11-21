'use server';

import { PrismaClient, TodoCategory, Priority, Status, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function getTodos({
  category,
  priority,
  status,
  searchQuery,
}: {
  category?: TodoCategory | 'All';
  priority?: Priority | 'All';
  status?: Status | 'All';
  searchQuery?: string;
}) {
  try {
    const where: Prisma.TodoWhereInput = {
      AND: [
        category && category !== 'All' ? { category } : {},
        priority && priority !== 'All' ? { priority } : {},
        status && status !== 'All' ? { status } : {},
        searchQuery
          ? {
              OR: [
                { title: { contains: searchQuery, mode: 'insensitive' } as Prisma.StringFilter },
                { content: { contains: searchQuery, mode: 'insensitive' } as Prisma.StringFilter },
              ],
            }
          : {},
      ].filter(condition => Object.keys(condition).length > 0),
    };

    return await prisma.todo.findMany({ 
      where,
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw new Error('Failed to fetch todos');
  }
}

export async function createTodo({
  title,
  content,
  category,
  priority,
  dueDate,
  url,
}: {
  title: string;
  content?: string;
  category: TodoCategory;
  priority: Priority;
  dueDate?: string | null;
  url?: string | null;
}) {
  try {
    const todo = await prisma.todo.create({
      data: {
        title,
        content,
        category,
        priority,
        status: Status.PENDING,
        dueDate: dueDate ? new Date(dueDate) : null,
        url: url || null,
      },
    });
    revalidatePath('/');
    return todo;
  } catch (error) {
    console.error('Error creating todo:', error);
    throw new Error('Failed to create todo');
  }
}

export async function updateTodo(id: string, data: {
  title?: string;
  content?: string;
  category?: TodoCategory;
  priority?: Priority;
  status?: Status;
  dueDate?: string | null;
  url?: string | null;
}) {
  try {
    const todo = await prisma.todo.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        url: data.url?.trim() || null,
      },
    });
    
    // Revalidate both the home page and the specific todo page
    revalidatePath('/');
    revalidatePath('/view/[id]');
    revalidatePath(`/view/${id}`);
    
    return todo;
  } catch (error) {
    console.error('Error updating todo:', error);
    throw new Error('Failed to update todo');
  }
}

export async function deleteTodo(id: string) {
  try {
    await prisma.todo.delete({
      where: { id },
    });
    revalidatePath('/');
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw new Error('Failed to delete todo');
  }
}

export async function getTodoById(id: string) {
  try {
    return await prisma.todo.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Error fetching todo:', error);
    throw new Error('Failed to fetch todo');
  }
}

// Initialize the database
console.log('Starting database initialization...');
prisma.$connect().catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});
