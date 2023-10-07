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

  const result = await Promise.all(
    Object.keys(list).flatMap((k) => {
      return list[k as Type].map((t) => {
        return db.todo.update({
          where: {
            id: t.id
          },
          data: {
            type: t.type
          }
        });
      });
    })
  );

  return NextResponse.json(result);
};

export const DELETE = async () => {
  await redis.getdel('todos');
  await db.todo.deleteMany();

  return NextResponse.json('ok');
};

export const PUT = async () => {
  await redis.getdel('todos');
  await db.todo.deleteMany();
  await db.todo.createMany({
    data: [
      {
        type: 'ALL',
        text: 'Что то нужно сделать...',
        date: new Date(),
        title: 'Тудушка 1',
        image: 'https://utfs.io/f/b144a97a-3f23-4e49-8171-9f1c9e8de3de-2x.webp'
      },
      {
        type: 'INPROGRESS',
        text: 'Начинаем...',
        date: new Date(),
        title: 'Тудушка 2',
        image: 'https://utfs.io/f/b144a97a-3f23-4e49-8171-9f1c9e8de3de-2x.webp'
      },
      {
        type: 'DONE',
        text: 'Сделано!',
        date: new Date(),
        title: 'Тудушка 3',
        image: 'https://utfs.io/f/b144a97a-3f23-4e49-8171-9f1c9e8de3de-2x.webp'
      }
    ]
  });

  return NextResponse.json('ok');
};
