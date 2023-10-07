'use client';
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Todo } from '.prisma/client';
import { useStore } from '@/store/app';
import Image from 'next/image';
import { Type } from '@prisma/client';
import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from '@hello-pangea/dnd';
import axios from 'axios';

type TodoListProps = {
  className?: string;
  todos: { [key in Type]: Todo[] };
};

const typeMap: Record<Type, string> = {
  ALL: 'Все',
  INPROGRESS: 'В процессе',
  DONE: 'Готовые'
};
const order = Object.keys(typeMap);

const TodoLists = ({ className, todos }: TodoListProps) => {
  const isLoading = useStore.use.isLoading();
  const [list, setList] = useState(todos);

  useEffect(() => {
    setList(todos);
  }, [todos]);

  const handleDragEnd: OnDragEndResponder = async (result) => {
    if (!result.destination) {
      return;
    }
    const destinationType = result.destination.droppableId as Type;
    const sourceType = result.source.droppableId as Type;
    const stateCopy = structuredClone(list);

    if (destinationType === sourceType) {
      const [removed] = stateCopy[sourceType].splice(result.source.index, 1);
      stateCopy[destinationType].splice(result.destination.index, 0, removed);
      setList(stateCopy);
    } else {
      const [removedTodo] = stateCopy[sourceType].splice(result.source.index, 1);
      removedTodo.type = destinationType;
      stateCopy[destinationType].splice(result.destination.index, 0, removedTodo);
    }

    setList(stateCopy);
    await axios.patch('/api/todos', stateCopy);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {(
        Object.entries(list).sort(([key], [key2]) => {
          return order.indexOf(key) - order.indexOf(key2);
        }) as unknown as [Type, Todo[]][]
      ).map(([type, todos]) => (
        <Droppable key={type} droppableId={type} direction={'vertical'}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={'border w-1/3 rounded'}
            >
              <h2 className={'text-xl text-center font-bold border-b mb-2 p-3'}>{typeMap[type]}</h2>
              <ul className={cn(className, isLoading && 'opacity-50', 'space-y-4 p-4')}>
                {todos?.map((t, index) => (
                  <Draggable key={t.id} draggableId={t.id} index={index}>
                    {(provided) => {
                      return (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={cn('ring rounded', {
                            ['ring-green-300']: type === 'DONE',
                            ['ring-amber-300']: type === 'INPROGRESS',
                            ['ring-pink-300']: type === 'ALL'
                          })}
                        >
                          <h3
                            className={cn(
                              'text-xl italic font-bold text-center mb-2 first-letter:uppercase',
                              {
                                ['text-green-300']: type === 'DONE',
                                ['text-amber-300']: type === 'INPROGRESS',
                                ['text-pink-300']: type === 'ALL'
                              }
                            )}
                          >
                            {t.title}
                          </h3>
                          {t.image && (
                            <div className={'relative h-[140px] w-full'}>
                              <Image src={t.image} fill alt={'photo'}></Image>
                            </div>
                          )}
                          <p
                            className={cn('rounded p-2', {
                              ['bg-green-300']: type === 'DONE',
                              ['bg-amber-300']: type === 'INPROGRESS',
                              ['bg-pink-300']: type === 'ALL'
                            })}
                          >
                            {t.text}
                          </p>
                          <p className={'grid text-sm italic font-black p-2'}>
                            <span> Дэдлайн:</span>
                            {new Intl.DateTimeFormat('ru-RU', {
                              dateStyle: 'full'
                            }).format(new Date(t.date))}
                          </p>
                        </li>
                      );
                    }}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            </div>
          )}
        </Droppable>
      ))}
    </DragDropContext>
  );
};

export default TodoLists;
