'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/app';
import Image from 'next/image';
import { FileImage, Loader2, Mouse } from 'lucide-react';
import { uploadFiles } from '@/lib/uploadthing';
import { z } from 'zod';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';

import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';

type CreateTodoProps = {
  className?: string;
};

const validator = z.object({
  date: z.date({
    coerce: true,
    errorMap: () => ({ message: 'Введите дату' })
  }),
  text: z.string().min(1, { message: 'Нет сообщения' }),
  title: z.string().min(1, { message: 'Нет названия' })
});

const CreateTodo = ({ className }: CreateTodoProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const setLoading = useStore.use.setLoading();
  const setError = useStore.use.setError();
  const [image, setImage] = useState('');
  const [file, setFile] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  useEffect(() => {
    setLoading(isPending);

    if (!isPending) {
      setIsLoading(false);
      setIsFormOpen(false);
    }
  }, [isPending, setLoading]);

  const handleImageChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    if (!e.target.files) {
      return;
    }

    const url = URL.createObjectURL(e.target.files[0]);
    setImage(url);

    setFile(e.target.files);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (evt) => {
    evt.preventDefault();
    setIsLoading(true);

    const elements = evt.currentTarget.elements;
    const title = elements.namedItem('title') as HTMLTextAreaElement;
    const todo = elements.namedItem('todo') as HTMLInputElement;
    const form = evt.currentTarget;

    const data = {
      title: title.value,
      date: startDate,
      text: todo.value,
      image: ''
    };

    try {
      validator.parse(data);

      if (file?.[0]) {
        const [res] = await uploadFiles({
          endpoint: 'imageUploader',
          files: [file[0]],
          input: undefined
        });

        data.image = res.url;
      }

      const response = await fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setFile(null);
        setImage('');
        setStartDate(null);
        form.reset();
        startTransition(() => {
          router.refresh();
        });
      } else {
        await Promise.reject();
      }
    } catch (e) {
      setIsLoading(false);

      if (e instanceof z.ZodError) {
        const err = Object.values(e.flatten().fieldErrors);
        setError({
          text: `${err[0]}`,
          isError: true
        });
      } else {
        setError({
          text: `Не предвиденная ошибка`,
          isError: true
        });
      }
    }
  };

  return (
    <section className={cn(className, 'text-center space-y-2 ')}>
      <Collapsible open={isFormOpen} onOpenChange={setIsFormOpen}>
        <h2 className={'text-xl font-bold'}>Создать тудушку</h2>
        <CollapsibleTrigger>
          <Mouse className={cn(isFormOpen && 'text-pink-200')} />
        </CollapsibleTrigger>
        <CollapsibleContent className={cn(isFormOpen ? 'col-anim-down' : 'col-anim-up')}>
          <form
            className={'min-w-[300px] space-y-4 flex flex-col border p-4'}
            onSubmit={handleSubmit}
          >
            <div className={'flex items-center justify-between gap-x-2'}>
              <label htmlFor="title" className={'cursor-pointer  max-w-[80px] w-full'}>
                Название
              </label>
              <input type="text" id={'title'} className={'ring-1 p-1 w-full outline-blue-600'} />
            </div>
            <div className={'flex items-center justify-between gap-x-2'}>
              <label htmlFor="date" className={'cursor-pointer max-w-[80px] w-full'}>
                К числу
              </label>
              <DatePicker
                autoComplete={'false'}
                onInputClick={() => !startDate && setStartDate(new Date())}
                placeholderText={new Intl.DateTimeFormat('ru-RU', {
                  dateStyle: 'short'
                }).format(new Date())}
                className={'ring-1 w-full p-1 cursor-pointer outline-blue-600'}
                id={'date'}
                selected={startDate}
                onChange={(date) => {
                  console.log(date);
                  setStartDate(date);
                }}
                dateFormat={'dd.MM.yyyy'}
              />
            </div>
            {image && (
              <div className={'relative min-h-[80px]'}>
                <Image className={'object-contain'} fill src={image} alt={'image'}></Image>
              </div>
            )}
            <label
              htmlFor={'file'}
              className={
                'group flex mx-auto items-center justify-center text-center cursor-pointer hover:text-pink-600'
              }
            >
              {' '}
              Фоточка
              <FileImage className={'text-pink-200 group-hover:text-pink-600'} />
              <input
                onChange={handleImageChange}
                type="file"
                id={'file'}
                accept="image/*"
                className={'sr-only'}
              />
            </label>
            <label htmlFor="todo" className={'cursor-pointer italic mb-2 block'}>
              Описание
            </label>
            <textarea
              name="text"
              id="todo"
              rows={5}
              className={
                'w-full h-[100px] resize-none ring-1 border-amber-400 outline-blue-600 italic '
              }
            />
            <button
              disabled={isLoading || isPending}
              className={
                'p-2 hover:bg-zinc-200/50 active:scale-[1.01] active:translate-x-[2px] shadow ring-1 transition-shadow rounded flex items-center justify-center gap-x-2'
              }
            >
              {(isLoading || isPending) && <Loader2 className={'animate-spin'} />}
              Создать
            </button>
          </form>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
};

export default CreateTodo;
