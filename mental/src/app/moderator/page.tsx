
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, MessageSquare, AlertTriangle, ShieldCheck } from 'lucide-react';

const ModeratorDashboard = () => {
  const [activeTab, setActiveTab] = useState('conversations');

  const conversations = [
    { id: 1, user: 'Alice', lastMessage: 'Feeling really down', status: 'waiting', priority: 'high' },
    { id: 2, user: 'Bob', lastMessage: 'Just need to talk', status: 'active', priority: 'medium' },
    { id: 3, user: 'Charlie', lastMessage: 'Thank you for your help', status: 'resolved', priority: 'low' },
    { id: 4, user: 'David', lastMessage: 'I am in a crisis!', status: 'active', priority: 'crisis' },
    { id: 5, user: 'Eve', lastMessage: 'Feeling anxious about my exams', status: 'waiting', priority: 'high' },
    { id: 6, user: 'Frank', lastMessage: 'I think I need help', status: 'waiting', priority: 'crisis' },
  ];

  const users = [
    { id: 1, name: 'Alice', mood: 'Low', joined: '2023-10-27' },
    { id: 2, name: 'Bob', mood: 'Okay', joined: '2023-10-26' },
  ];

  const crisisAlerts = conversations.filter(c => c.priority === 'crisis');

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold mb-8">Moderator Dashboard</h1>
        <nav>
          <ul>
            <li className="mb-4">
              <Button variant={activeTab === 'conversations' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('conversations')} className="w-full justify-start">
                <MessageSquare className="mr-2" /> Conversations
              </Button>
            </li>
            <li className="mb-4">
              <Button variant={activeTab === 'users' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('users')} className="w-full justify-start">
                <Users className="mr-2" /> Users
              </Button>
            </li>
            <li className="mb-4">
              <Button variant={activeTab === 'crisis' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('crisis')} className="w-full justify-start text-red-500">
                <AlertTriangle className="mr-2" /> Crisis Alerts
              </Button>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <div className="grid grid-cols-4 gap-6 mb-6">
            <Card>
                <h3 className="font-bold text-lg">Active Conversations</h3>
                <p className="text-3xl">{conversations.filter(c => c.status === 'active').length}</p>
            </Card>
            <Card>
                <h3 className="font-bold text-lg">Waiting Users</h3>
                <p className="text-3xl">{conversations.filter(c => c.status === 'waiting').length}</p>
            </Card>
            <Card className="text-red-500">
                <h3 className="font-bold text-lg">Crisis Alerts</h3>
                <p className="text-3xl">{crisisAlerts.length}</p>
            </Card>
            <Card>
                <h3 className="font-bold text-lg">Total Users</h3>
                <p className="text-3xl">{users.length}</p>
            </Card>
        </div>

        {activeTab === 'conversations' && (
          <Card>
            <h2 className="text-xl font-bold mb-4">All Conversations</h2>
            <div className="space-y-4">
              {conversations.map(convo => (
                <div key={convo.id} className={`p-4 rounded-lg ${convo.priority === 'crisis' ? 'bg-red-200' : 'bg-gray-50'}`}>
                  <div className="flex justify-between">
                    <p className="font-bold">{convo.user}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${convo.priority === 'high' ? 'bg-yellow-200' : convo.priority === 'medium' ? 'bg-blue-200' : 'bg-gray-200'}`}>
                      {convo.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{convo.lastMessage}</p>
                  <div className="text-xs text-gray-500 mt-2">Status: {convo.status}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'users' && (
          <Card>
            <h2 className="text-xl font-bold mb-4">User Management</h2>
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th>Name</th>
                  <th>Mood</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.mood}</td>
                    <td>{user.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {activeTab === 'crisis' && (
            <Card className="border-red-500">
                <h2 className="text-xl font-bold mb-4 text-red-500">Crisis Alerts</h2>
                <div className="space-y-4">
                    {crisisAlerts.map(convo => (
                        <div key={convo.id} className="p-4 rounded-lg bg-red-100 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-red-800">{convo.user}</p>
                                <p className="text-sm text-red-600">{convo.lastMessage}</p>
                            </div>
                            <Button variant="destructive">Respond Immediately</Button>
                        </div>
                    ))}
                </div>
            </Card>
        )}
      </main>
    </div>
  );
}

export default ModeratorDashboard;
