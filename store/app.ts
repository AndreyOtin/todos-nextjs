import { create, StoreApi, UseBoundStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(_store: S) => {
  const store = _store as WithSelectors<typeof _store>;
  store.use = {};
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  for (const k of Object.keys(store.getState())) {
    (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
  }

  return store;
};

type ToastError = {
  isError: boolean;
  text: string;
};

type Store = {
  error: ToastError;
  isLoading: boolean;
  setLoading: (isLoading: Store['isLoading']) => void;
  setError: (isLoading: Store['error']) => void;
};

export const useStore = createSelectors(
  create(
    immer<Store>((set) => ({
      error: {
        isError: false,
        text: ''
      },
      isLoading: false,
      setLoading: (isLoading: Store['isLoading']) =>
        set((state) => {
          state.isLoading = isLoading;
        }),
      setError: ({ isError, text }: Store['error']) => {
        set((state) => {
          state.error.isError = isError;
          state.error.text = text;
        });
      }
    }))
  )
);
