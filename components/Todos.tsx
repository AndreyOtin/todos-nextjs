import React from 'react';
import { cn } from '@/lib/utils';
import TodoLists from '@/components/TodoLists';
import db from '@/lib/prisma/db';
import redis from '@/lib/redis';
import { List } from '@/types/app';

type TodosProps = {
  className?: string;
};

const Todos = async ({ className }: TodosProps) => {
  let todos = await redis.get<List>('todos');

  if (!todos) {
    const data = await db.todo.findMany();
    const sortedTodos: List = {
      DONE: [],
      ALL: [],
      INPROGRESS: []
    };

    data.forEach((t) => {
      sortedTodos[t.type].push(t);
    });

    todos = sortedTodos;
  }

  return (
    <div className={cn(className, 'w-full')}>
      <h2 className={'text-center text-2xl font-bold italic mb-6'}>Todos</h2>
      <div className={'flex gap-x-2 w-1/2 justify-between mx-auto items-start'}>
        <TodoLists todos={todos} />
      </div>
    </div>
  );
};

export default Todos;
