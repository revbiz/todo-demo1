import { PrismaClient, TodoCategory, Priority, Status } from "@prisma/client";

declare global {
  var cachedPrisma: PrismaClient;
}

let prisma: PrismaClient;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }
  prisma = global.cachedPrisma;
}

export const db = prisma;

export async function getAllTodos() {
  try {
    return await db.todo.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  } catch (error) {
    console.error('Error getting todos:', error);
    throw error;
  }
}

export async function addTodo(title: string, description?: string) {
  try {
    return await db.todo.create({
      data: {
        title,
        description: description || '',
        category: 'Now' as TodoCategory,
        priority: 'Medium' as Priority,
        status: 'Active' as Status,
        dueDate: null,
        color: null
      }
    });
  } catch (error) {
    console.error('Error adding todo:', error);
    throw error;
  }
}

export async function updateTodo(
  id: string,
  data: {
    title?: string;
    description?: string;
    category?: TodoCategory;
    priority?: Priority;
    status?: Status;
    dueDate?: string | null;
    color?: string | null;
  }
) {
  try {
    return await db.todo.update({
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
    return await db.todo.delete({
      where: { id }
    });
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
}

export async function getTodoById(id: string) {
  try {
    return await db.todo.findUnique({
      where: { id }
    });
  } catch (error) {
    console.error('Error getting todo:', error);
    throw error;
  }
}

// Initialize the database
console.log('Starting database initialization...');
db.$connect().catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});
