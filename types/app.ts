import { Type } from '@prisma/client';
import { Todo } from '.prisma/client';

export type List = Record<Type, Todo[]>;
