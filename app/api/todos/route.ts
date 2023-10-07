import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/prisma/db';
import { Todo } from '.prisma/client';
import { Type } from '@prisma/client';
import redis from '@/lib/redis';

export const POST = async (req: NextRequest) => {
  const { text, date, image, title } = (await req.json()) as Todo;

  const todo = await db.todo.create({
    data: {
      text,
      date,
      image,
      title
    }
  });

  const list = await redis.get<{ [key in Type]: Todo[] }>('todos');

  if (list) {
    list.ALL.push(todo);
    await redis.set('todos', list);
  }

  return NextResponse.json('ok');
};

export const PATCH = async (req: NextRequest) => {
  const list = (await req.json()) as { [key in Type]: Todo[] };

  await redis.set('todos', list);

  Object.keys(list).forEach((k) => {
    list[k as Type].forEach(async (t) => {
      await db.todo.update({
        where: {
          id: t.id
        },
        data: {
          type: t.type
        }
      });
    });
  });

  return NextResponse.json('ok');
};

export const DELETE = async () => {
  await redis.getdel('todos');
  await db.todo.deleteMany();

  return NextResponse.json('ok');
};
