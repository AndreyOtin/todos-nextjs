'use client';
import React, { useEffect, useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';

type HeaderProps = {
  className?: string;
};

const Header = ({ className }: HeaderProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isPending) {
      setIsLoading(false);
    }
  }, [isPending]);

  return (
    <header className={cn(className, 'min-h-[80px] flex flex-col bg-red-300')}>
      <div className="container mx-auto text-white flex-1 flex items-center p-2">
        <p className={'italic font-bold text-2xl'}>Todos</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
          }}
          action="#"
          className={'flex gap-x-2 items-center ml-auto'}
        >
          <label htmlFor="trash" className={'cursor-pointer'}>
            <span className={'sr-only'}>Удалить все</span>
            {isPending || isLoading ? <Loader2 className={'animate-spin'} /> : <Trash />}
          </label>
          <input
            onClick={async () => {
              setIsLoading(true);
              await fetch('/api/todos', { method: 'DELETE' });
              startTransition(() => {
                router.refresh();
              });
            }}
            disabled={isPending || isLoading}
            type={'submit'}
            defaultValue={'Удалить все'}
            id={'trash'}
            className={'text-white cursor-pointer rounded p-0'}
            placeholder={''}
          />
          <label htmlFor="clean" className={'cursor-pointer'}>
            <span className={'sr-only'}>Очистить</span>
            {isPending || isLoading ? <Loader2 className={'animate-spin'} /> : <Trash />}
          </label>
          <input
            onClick={async () => {
              setIsLoading(true);
              await fetch('/api/todos', { method: 'PUT' });
              startTransition(() => {
                router.refresh();
              });
            }}
            disabled={isPending || isLoading}
            type={'submit'}
            defaultValue={'Очистить'}
            id={'clean'}
            className={'text-white cursor-pointer rounded p-0'}
            placeholder={''}
          />
        </form>
      </div>
    </header>
  );
};

export default Header;
