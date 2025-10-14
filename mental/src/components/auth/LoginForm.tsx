'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleLogin = (role: 'user' | 'moderator') => {
    if (!email || !password) {
      alert('Please enter email and password.');
      return;
    }
    // Handle login logic here
    console.log('Logging in as', role, 'with', email, password);
    login(role);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card>
        <div className="flex flex-col items-center mb-6">
          <img src="/image.png" alt="Mental Health Companion" className="h-14 w-14 mb-4" />
          <h2 className="text-2xl font-bold">Mental Health Companion</h2>
          <p className="text-gray-500">Sign in to continue</p>
        </div>
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex space-x-4">
            <Button onClick={() => handleLogin('user')} className="w-full bg-black text-white">
              Login as User
            </Button>
            <Button onClick={() => handleLogin('moderator')} className="w-full bg-black text-white">
              Login as Moderator
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
