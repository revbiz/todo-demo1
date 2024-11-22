'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Status, Priority, TodoCategory } from "@prisma/client";
import DOMPurify from 'isomorphic-dompurify';

// Configure DOMPurify for server-side sanitization
const sanitizeConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code',
    'pre', 'hr', 'span', 'div'
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
};

export async function getTodos() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return todos;
  } catch (error) {
    console.error('Error fetching todos:', error);
    return [];
  }
}

export async function getTodoById(id: string) {
  try {
    const todo = await prisma.todo.findUnique({
      where: { id }
    });
    return todo;
  } catch (error) {
    console.error('Error fetching todo:', error);
    return null;
  }
}

export async function createTodo(formData: FormData) {
  const rawTitle = formData.get('title') as string;
  const rawContent = formData.get('content') as string;
  const url = formData.get('url') as string;
  const category = formData.get('category') as TodoCategory;
  const priority = formData.get('priority') as Priority;
  const status = formData.get('status') as Status;
  const dueDate = formData.get('dueDate') as string;

  // Sanitize rich text content
  const title = DOMPurify.sanitize(rawTitle, sanitizeConfig);
  const content = DOMPurify.sanitize(rawContent, sanitizeConfig);

  try {
    await prisma.todo.create({
      data: {
        title,
        content,
        url: url || null,
        category: category || TodoCategory.OTHER,
        priority: priority || Priority.MEDIUM,
        status: status || Status.PENDING,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });
    
    revalidatePath('/');
    revalidatePath('/dashboard');
    redirect('/');
  } catch (error) {
    console.error('Error creating todo:', error);
    return { error: 'Failed to create todo' };
  }
}

export async function updateTodo(formData: FormData) {
  const id = formData.get('id') as string;
  const rawTitle = formData.get('title') as string;
  const rawContent = formData.get('content') as string;
  const url = formData.get('url') as string;
  const category = formData.get('category') as TodoCategory;
  const priority = formData.get('priority') as Priority;
  const status = formData.get('status') as Status;
  const dueDate = formData.get('dueDate') as string;

  // Sanitize rich text content
  const title = DOMPurify.sanitize(rawTitle, sanitizeConfig);
  const content = DOMPurify.sanitize(rawContent, sanitizeConfig);

  try {
    await prisma.todo.update({
      where: { id },
      data: {
        title,
        content,
        url: url || null,
        category: category || undefined,
        priority: priority || undefined,
        status: status || undefined,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });
    
    revalidatePath('/');
    revalidatePath('/dashboard');
    redirect('/');
  } catch (error) {
    console.error('Error updating todo:', error);
    return { error: 'Failed to update todo' };
  }
}

export async function deleteTodo(id: string) {
  try {
    await prisma.todo.delete({
      where: { id },
    });
    
    revalidatePath('/');
    revalidatePath('/dashboard');
    redirect('/');
  } catch (error) {
    console.error('Error deleting todo:', error);
    return { error: 'Failed to delete todo' };
  }
}