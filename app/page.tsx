"use client"
import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';

type Props = {}

const Home = (props: Props) => {
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-4xl font-bold mb-6'>
        COMECE JÁ A GERAÇÃO DOS SEUS MELHORES CURSOS
      </h1>
      <p className='text-lg text-gray-600'>
        Transforme suas ideias em experiências educacionais incríveis com a nossa solução.
      </p>
      <Button
        className='mt-8'
        onClick={() => {
          signIn('google');
        }}
      >
        Começar Agora
      </Button>
    </div>
  );
}

export default Home;