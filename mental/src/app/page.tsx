
'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.role === 'user') {
        router.push('/user/dashboard');
      } else if (user.role === 'moderator') {
        router.push('/moderator/dashboard');
      }
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  return (
    <main>
      <LoginForm />
    </main>
  );
}
