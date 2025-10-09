
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

  const handleLogin = () => {
    // Handle login logic here
    console.log('Logging in with', email, password);
  };

  const handleUserLogin = () => {
    login('user');
  };

  const handleModeratorLogin = () => {
    login('moderator');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card>
        <div className="flex flex-col items-center mb-6">
          <img src="/file.svg" alt="Mental Health Companion" className="h-12 w-12 mb-4" />
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
          <Button onClick={handleLogin} className="w-full bg-black text-white">Sign In</Button>
        </div>
        <div className="my-6 text-center text-sm text-gray-500">
          <p>Sign in to continue</p>
        </div>
        <div className="space-y-4">
          <Button onClick={handleUserLogin} variant="secondary" className="w-full">Login as User</Button>
          <Button onClick={handleModeratorLogin} variant="secondary" className="w-full">Login as Moderator</Button>
        </div>
      </Card>
    </div>
  );
};
