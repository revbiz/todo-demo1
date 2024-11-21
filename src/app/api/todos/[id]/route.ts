'use server';

import { getTodoById, updateTodo, deleteTodo } from "@/lib/db";
import { NextResponse } from "next/server";
import { TodoCategory, Priority, Status } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const todo = await getTodoById(params.id);
    if (!todo) {
      return NextResponse.json(
        { error: "Todo not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(todo);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch todo" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, content, category, priority, status, dueDate } = body;

    const todo = await updateTodo(params.id, {
      title,
      content,
      category: category as TodoCategory,
      priority: priority as Priority,
      status: status as Status,
      dueDate: dueDate ? dueDate : null,
    });

    return NextResponse.json(todo);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update todo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteTodo(params.id);
    return NextResponse.json({ message: "Todo deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}
