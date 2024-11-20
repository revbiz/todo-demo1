import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function getAllTodos() {
  try {
    return await prisma.todo.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  } catch (error) {
    console.error('Error getting todos:', error);
    throw error;
  }
}

export async function addTodo(title: string, content?: string) {
  try {
    return await prisma.todo.create({
      data: {
        title,
        content,
        completed: false
      }
    });
  } catch (error) {
    console.error('Error adding todo:', error);
    throw error;
  }
}

export async function updateTodo(id: string, data: { completed?: boolean; title?: string; content?: string }) {
  try {
    return await prisma.todo.update({
      where: { id },
      data
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
}

export async function deleteTodo(id: string) {
  try {
    return await prisma.todo.delete({
      where: { id }
    });
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
}

export async function getTodoById(id: string) {
  try {
    return await prisma.todo.findUnique({
      where: { id }
    });
  } catch (error) {
    console.error('Error getting todo:', error);
    throw error;
  }
}

// Initialize the database
console.log('Starting database initialization...');
prisma.$connect().catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});
