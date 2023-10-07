import Todos from '@/components/Todos';
import CreateTodo from '@/components/CreateTodo';
import db from '@/lib/prisma/db';
import redis from '@/lib/redis';

export const revalidate = 0;

setInterval(async () => {
  await redis.getdel('todos');
  await db.todo.deleteMany();
  await db.todo.createMany({
    data: [
      {
        type: 'ALL',
        text: 'Что то нужно сделать...',
        date: new Date(),
        title: 'Тудушка 1',
        image: ''
      },
      {
        type: 'INPROGRESS',
        text: 'Начинаем...',
        date: new Date(),
        title: 'Тудушка 2',
        image: ''
      },
      {
        type: 'DONE',
        text: 'Сделано!',
        date: new Date(),
        title: 'Тудушка 3',
        image: ''
      }
    ]
  });
}, 1000 * 60);

export default function Home() {
  return (
    <main className="flex flex-col items-center flex-1">
      <CreateTodo className={'mt-4'} />
      <Todos className={'mt-4'} />
    </main>
  );
}
