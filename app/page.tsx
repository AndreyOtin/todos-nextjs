import Todos from '@/components/Todos';
import CreateTodo from '@/components/CreateTodo';

export const revalidate = 0;

export default function Home() {
  return (
    <main className="flex flex-col items-center flex-1">
      <CreateTodo className={'mt-4'} />
      <Todos className={'mt-4'} />
    </main>
  );
}
