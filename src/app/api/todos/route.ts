'use server';

import { getTodos, createTodo } from "@/lib/db";
import { NextResponse } from "next/server";
import { TodoCategory, Priority } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as TodoCategory | 'All' || 'All';
    const priority = searchParams.get('priority') as Priority | 'All' || 'All';
    const searchQuery = searchParams.get('q') || '';

    const todos = await getTodos({
      category,
      priority,
      searchQuery,
    });

    return NextResponse.json(todos);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch todos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, category, priority, dueDate, url } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const todo = await createTodo({
      title: title.trim(),
      content: content || '',
      category: category as TodoCategory,
      priority: priority as Priority,
      dueDate: dueDate ? dueDate : null,
      url: url ? url.trim() : null,
    });

    return NextResponse.json(todo);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    );
  }
}
