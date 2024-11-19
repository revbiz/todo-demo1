import { NextResponse } from 'next/server';
import { getAllTodos, addTodo, updateTodo, deleteTodo } from '@/lib/db';
import { Todo } from '@/types/todo';
import { ObjectId } from 'mongodb';

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
    const todo: Todo = {
      _id: new ObjectId().toString(), // Generate new MongoDB ID
      text: data.text,
      completed: false,
      createdAt: new Date().toISOString()
    };
    await addTodo(todo);
    return NextResponse.json(todo);
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
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const data = await request.json();
    await deleteTodo(data._id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/todos:', error);
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}
