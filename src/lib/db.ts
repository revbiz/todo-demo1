import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { Todo } from '@/types/todo';
import path from 'path';
import fs from 'fs';

// Use an absolute path for the database file
const dbPath = path.join(process.cwd(), 'todos.db');
console.log('Database path:', dbPath);

// Ensure the database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

async function openDb() {
  try {
    console.log('Opening database connection...');
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    console.log('Database connection opened successfully');
    return db;
  } catch (error) {
    console.error('Error opening database:', error);
    throw error;
  }
}

async function initDb() {
  console.log('Initializing database...');
  const db = await openDb();
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL
      )
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await db.close();
  }
}

export async function getAllTodos(): Promise<Todo[]> {
  console.log('Getting all todos...');
  const db = await openDb();
  try {
    const todos = await db.all('SELECT * FROM todos ORDER BY createdAt DESC');
    console.log('Retrieved todos:', todos);
    return todos.map(todo => ({
      ...todo,
      completed: Boolean(todo.completed),
      createdAt: todo.createdAt // Keep as ISO string, will be converted to Date in frontend
    }));
  } catch (error) {
    console.error('Error getting todos:', error);
    throw error;
  } finally {
    await db.close();
  }
}

export async function addTodo(todo: Todo): Promise<void> {
  console.log('Adding todo:', todo);
  const db = await openDb();
  try {
    // createdAt is already an ISO string now
    await db.run(
      'INSERT INTO todos (id, text, completed, createdAt) VALUES (?, ?, ?, ?)',
      [todo.id, todo.text, todo.completed ? 1 : 0, todo.createdAt]
    );
    console.log('Todo added successfully');
  } catch (error) {
    console.error('Error adding todo:', error);
    throw error;
  } finally {
    await db.close();
  }
}

export async function updateTodo(id: string, updates: { completed?: boolean; text?: string }): Promise<void> {
  console.log('Updating todo:', { id, updates });
  const db = await openDb();
  try {
    if (updates.completed !== undefined) {
      await db.run(
        'UPDATE todos SET completed = ? WHERE id = ?',
        [updates.completed ? 1 : 0, id]
      );
    }
    if (updates.text !== undefined) {
      await db.run(
        'UPDATE todos SET text = ? WHERE id = ?',
        [updates.text, id]
      );
    }
    console.log('Todo updated successfully');
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  } finally {
    await db.close();
  }
}

export async function deleteTodo(id: string): Promise<void> {
  console.log('Deleting todo:', id);
  const db = await openDb();
  try {
    await db.run('DELETE FROM todos WHERE id = ?', [id]);
    console.log('Todo deleted successfully');
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  } finally {
    await db.close();
  }
}

// Initialize the database
console.log('Starting database initialization...');
initDb().catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});
