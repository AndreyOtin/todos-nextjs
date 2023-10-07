'use client';
import * as Toast from '@radix-ui/react-toast';
import { useStore } from '@/store/app';

const Toaster = () => {
  const error = useStore.use.error();
  const setError = useStore.use.setError();

  return (
    <Toast.Provider duration={3000} swipeDirection={'right'}>
      <Toast.Root
        open={error.isError}
        onOpenChange={() => setError({ isError: false, text: error.text })}
        className={
          'absolute top-0 left-1/2 -translate-x-1/2 bg-red-500 text-white p-4 flex justify-center flex-col items-center ToastRoot'
        }
      >
        <Toast.Viewport></Toast.Viewport>
        <Toast.Title>Ошибка</Toast.Title>
        <Toast.Description>{error.text}</Toast.Description>
        <Toast.Close />
      </Toast.Root>

      <Toast.Viewport />
    </Toast.Provider>
  );
};

export default Toaster;
