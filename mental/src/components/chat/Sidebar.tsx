'use client';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
    const { logout } = useAuth();

  return (
    <aside className="w-64 bg-white p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-3 mb-8">
          <img src="/image.png" alt="Mental Health Companion" className="h-10 w-10" />
          <h1 className="font-bold text-lg">Mental Health Companion</h1>
        </div>
        <nav>
          <ul>
            <li className="mb-4">
              <a href="#" className="flex items-center text-gray-700 hover:text-black font-medium">
                Chat
              </a>
            </li>
            <li className="mb-4">
              <a href="#" className="flex items-center text-gray-700 hover:text-black font-medium">
                Mood Tracker
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center text-gray-700 hover:text-black font-medium">
                Resources
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <Button onClick={logout} variant="secondary">Logout</Button>
    </aside>
  );
}
