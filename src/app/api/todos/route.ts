import { NextResponse } from 'next/server';
import { getAllTodos, addTodo, updateTodo, deleteTodo } from '@/lib/db';
import { Todo } from '@/types/todo';

export async function GET() {
  try {
    const todos = await getAllTodos();
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error in GET /api/todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newTodo = await addTodo({
      text: data.text,
      completed: false,
      createdAt: new Date().toISOString()
    });
    return NextResponse.json(newTodo);
  } catch (error) {
    console.error('Error in POST /api/todos:', error);
    return NextResponse.json(
      { error: 'Failed to add todo' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { _id, ...updates } = data;
    await updateTodo(_id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /api/todos:', error);
    if (error instanceof Error && error.message.includes('24 character hex string')) {
      return NextResponse.json(
        { error: 'Invalid todo ID format' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Todo ID is required' },
        { status: 400 }
      );
    }
    await deleteTodo(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/todos:', error);
    if (error instanceof Error && error.message.includes('24 character hex string')) {
      return NextResponse.json(
        { error: 'Invalid todo ID format' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}
