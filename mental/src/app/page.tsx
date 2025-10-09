
'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';

export default function Home() {
  const { isAuthenticated, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'user') {
        router.push('/user/dashboard');
      } else if (role === 'moderator') {
        router.push('/moderator/dashboard');
      }
    }
  }, [isAuthenticated, role, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <main>
      <LoginForm />
    </main>
  );
}
