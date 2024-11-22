"use client";

import TodoList from "@/components/TodoList";
import { Todo } from "@/types/todo";
import { useState } from "react";

interface TodoPageProps {
  todos: Todo[];
}

export default function TodoPage({ todos }: TodoPageProps) {
  return (
    <div>
      <TodoList todos={todos} />
    </div>
  );
}
