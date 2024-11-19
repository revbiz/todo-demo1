import { NextResponse } from 'next/server';
import { getAllTodos, addTodo, updateTodo, deleteTodo } from '@/lib/db';
import { Todo } from '@/types/todo';

export async function GET() {
  try {
    const todos = await getAllTodos();
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Failed to fetch todos:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch todos',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const todo: Todo = await request.json();
    console.log('Received todo:', todo);
    await addTodo(todo);
    const todos = await getAllTodos();
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Failed to add todo:', error);
    return NextResponse.json({ 
      error: 'Failed to add todo',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, completed, text } = await request.json();
    await updateTodo(id, { completed, text });
    const todos = await getAllTodos();
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Failed to update todo:', error);
    return NextResponse.json({ 
      error: 'Failed to update todo',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await deleteTodo(id);
    const todos = await getAllTodos();
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Failed to delete todo:', error);
    return NextResponse.json({ 
      error: 'Failed to delete todo',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
