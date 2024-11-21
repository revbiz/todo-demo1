import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { TodoCategory, Priority, Status } from '@prisma/client';

interface TodoData {
  title: string;
  description?: string;
  category: TodoCategory;
  priority: Priority;
  status: Status;
  dueDate?: string;
  url?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const todo = await db.todo.findUnique({
        where: { id },
      });
      if (!todo) {
        return NextResponse.json(
          { error: 'Todo not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(todo);
    }

    const todos = await db.todo.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title, description, category, priority, status, dueDate, url } = (await request.json()) as TodoData;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const todo = await db.todo.create({
      data: {
        title: title.trim(),
        description: description || '',
        category: category as TodoCategory,
        priority: priority as Priority,
        status: status as Status,
        dueDate: dueDate || null,
        url: url || null,
      },
    });

    return NextResponse.json(todo);
  } catch (error) {
    console.error("Error creating todo:", error);
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, title, description, category, priority, status, dueDate, url } = (await request.json()) as TodoData;
    
    if (!id) {
      return NextResponse.json(
        { error: "Todo ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      title: title?.trim(),
      description: description?.trim(),
      priority: priority as Priority,
      status: status as Status,
      dueDate: dueDate || null,
      url: url || null,
    };

    if (category) {
      updateData.category = category as TodoCategory;
    }

    const todo = await db.todo.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(todo);
  } catch (error) {
    console.error("Error updating todo:", error);
    return NextResponse.json(
      { error: "Failed to update todo" },
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

    await db.todo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return NextResponse.json({ message: "Error deleting todo", error }, { status: 500 });
  }
}
