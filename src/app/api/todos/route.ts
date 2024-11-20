import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { TodoCategory, Priority, Status } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const todo = await prisma.todo.findUnique({ where: { id } });
      if (!todo) {
        return NextResponse.json(
          { error: 'Todo not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(todo);
    }

    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    return NextResponse.json(
      { error: "Error fetching todos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    
    if (!json.title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const todo = await prisma.todo.create({
      data: {
        title: json.title.trim(),
        content: json.content || '',
        category: json.category as TodoCategory,
        priority: json.priority as Priority,
        status: json.status as Status,
      }
    });

    return NextResponse.json(todo);
  } catch (error) {
    console.error("Error creating todo:", error);
    return NextResponse.json({ message: "Error creating todo", error }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const json = await request.json();
    
    if (!json.id) {
      return NextResponse.json(
        { error: "Todo ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      title: json.title?.trim(),
      content: json.content,
      priority: json.priority as Priority,
      status: json.status as Status,
    };

    if (json.category) {
      updateData.category = json.category as TodoCategory;
    }

    const todo = await prisma.todo.update({
      where: { id: json.id },
      data: updateData,
    });

    return NextResponse.json(todo);
  } catch (error) {
    console.error("Error updating todo:", error);
    return NextResponse.json({ message: "Error updating todo", error }, { status: 500 });
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

    await prisma.todo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return NextResponse.json({ message: "Error deleting todo", error }, { status: 500 });
  }
}
