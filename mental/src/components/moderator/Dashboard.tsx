
'use client';

import { useState, useContext } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, MessageSquare, AlertTriangle, LogOut } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';

const ModeratorDashboard = () => {
  const [activeTab, setActiveTab] = useState('conversations');
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { logout } = auth;

  const conversations = [
    { id: 1, user: 'Shaina Ara', messages: 3, timestamp: '6:59:06 PM', lastMessage: 'I’m in crisis and need immediate support.', status: 'waiting', priority: 'crisis' },
    { id: 2, user: 'Jenella Yvonne', messages: 12, timestamp: '7:04:09 PM', lastMessage: 'I’m feeling really anxious about my upcoming presentation and could use some support.', status: 'waiting', priority: 'high' },
    { id: 3, user: 'Jamie Jodelle', messages: 8, timestamp: '6:04:09 PM', lastMessage: 'Thank you for the coping strategies. They really helped me today.', status: 'active', priority: 'medium' },
  ];

  const users = [
    { id: 1, name: 'Jamie Jodelle', email: 'jamie@example.com', joined: '6/20/2025', conversations: 15, lastActive: '6:04:09 PM' },
    { id: 2, name: 'Shaina Ara', email: 'ara@example.com', joined: '7/16/2025', conversations: 18, lastActive: '6:59:06 PM' },
    { id: 3, name: 'Jenella Yvonne', email: 'jenella@example.com', joined: '8/11/2025', conversations: 6, lastActive: '7:04:09 PM' },
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }

  const activeConversations = conversations.filter(c => c.status === 'active').length;
  const waitingForResponse = conversations.filter(c => c.status === 'waiting').length;
  const crisisPriority = conversations.filter(c => c.priority === 'crisis').length;

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
            <div className="bg-pink-100 p-2 rounded-full">
                <Users className="text-pink-500 w-8 h-8" />
            </div>
            <div>
                <h1 className="text-xl font-bold">Moderator Dashboard</h1>
                <p className="text-sm text-gray-500">Mental Health Companion Support</p>
            </div>
        </div>
        <div className="flex items-center space-x-4">
            <Button variant="outline">Switch to User view</Button>
            <Button variant="outline" onClick={logout}>Logout</Button>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <Card className="p-4 border">
            <h3 className="font-semibold text-gray-600">Active Conversations</h3>
            <p className="text-3xl font-bold">{activeConversations}</p>
        </Card>
        <Card className="p-4 border">
            <h3 className="font-semibold text-gray-600">Waiting for Response</h3>
            <p className="text-3xl font-bold">{waitingForResponse}</p>
        </Card>
        <Card className="p-4 border border-red-500">
            <h3 className="font-semibold text-red-500">Crisis Priority</h3>
            <p className="text-3xl font-bold text-red-500">{crisisPriority}</p>
        </Card>
        <Card className="p-4 border">
            <h3 className="font-semibold text-gray-600">Total Users</h3>
            <p className="text-3xl font-bold">{users.length}</p>
        </Card>
      </div>

      <div className="flex space-x-2 mb-6">
        <Button variant={activeTab === 'conversations' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('conversations')}>Conversations</Button>
        <Button variant={activeTab === 'users' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('users')}>Users</Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        {activeTab === 'conversations' && (
          <div>
              <h2 className="text-xl font-bold mb-2">Active Conversations</h2>
              <p className="text-gray-600 mb-6">Manage ongoing conversations and provide support to users</p>
              <div className="space-y-4">
                  {conversations.map(convo => (
                      <Card key={convo.id} className="p-4 flex items-center justify-between border">
                          <div className="flex items-center space-x-4">
                              <div className="bg-pink-100 text-pink-600 font-bold p-4 rounded-full flex items-center justify-center w-12 h-12">
                                  {getInitials(convo.user)}
                              </div>
                              <div>
                                  <div className="flex items-center space-x-2">
                                      <p className="font-bold">{convo.user}</p>
                                      {convo.priority === 'crisis' && <span className="bg-red-200 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">crisis</span>}
                                      {convo.priority === 'high' && <span className="bg-yellow-200 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">high</span>}
                                      {convo.priority === 'medium' && <span className="bg-blue-200 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">medium</span>}
                                      <span className="bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-1 rounded-full">{convo.status}</span>
                                  </div>
                                  <p className="text-sm text-gray-700 mt-1">{convo.lastMessage}</p>
                                  <p className="text-xs text-gray-500 mt-1">{convo.messages} messages · {convo.timestamp}</p>
                              </div>
                          </div>
                          <Button variant={convo.status === 'active' ? 'secondary' : 'default'}>
                              {convo.status === 'active' ? 'View' : 'Respond'}
                          </Button>
                      </Card>
                  ))}
              </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
              <h2 className="text-xl font-bold mb-2">User Management</h2>
              <p className="text-gray-600 mb-6">View and manage all users in the system</p>
              <div className="space-y-4">
                  {users.map(user => (
                      <Card key={user.id} className="p-4 flex items-center justify-between border">
                          <div className="flex items-center space-x-4">
                              <div className="bg-purple-100 text-purple-600 font-bold p-4 rounded-full flex items-center justify-center w-12 h-12">
                                  {getInitials(user.name)}
                              </div>
                              <div>
                                  <p className="font-bold">{user.name}</p>
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                  <p className="text-xs text-gray-500 mt-1">Joined: {user.joined} · {user.conversations} conversations · Last active: {user.lastActive}</p>
                              </div>
                          </div>
                          <Button variant={'outline'}>
                              View History
                          </Button>
                      </Card>
                  ))}
              </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModeratorDashboard;
