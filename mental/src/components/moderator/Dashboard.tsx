
'use client';

import { useState, useContext, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { Conversation, User } from '@/lib/types';

const ModeratorDashboard = () => {
  const [activeTab, setActiveTab] = useState('conversations');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const auth = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [conversationsResponse, usersResponse] = await Promise.all([
          fetch('/api/conversations'),
          fetch('/api/users'),
        ]);

        if (conversationsResponse.ok) {
          const conversationsData = await conversationsResponse.json();
          setConversations(conversationsData);
        } else {
          console.error('Failed to fetch conversations');
        }

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
        } else {
          console.error('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  if (!auth) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { logout } = auth;

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

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('conversations')}
              className={`${ activeTab === 'conversations' ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
              Conversations
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`${ activeTab === 'users' ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
              Users
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'conversations' && (
            <div>
                <h2 className="text-xl font-bold mb-2">Active Conversations</h2>
                <p className="text-gray-600 mb-6">Manage ongoing conversations and provide support to users</p>
                {conversations.length === 0 ? (
                  <p className="text-gray-500">No active conversations.</p>
                ) : (
                  <div className="space-y-4">
                      {conversations.map(convo => (
                          <Card key={convo.id} className="p-4 flex items-center justify-between border">
                              <div className="flex items-center space-x-4">
                                  <div className="bg-pink-100 text-pink-600 font-bold p-4 rounded-full flex items-center justify-center w-12 h-12">
                                      {getInitials(convo.user.name)}
                                  </div>
                                  <div>
                                      <div className="flex items-center space-x-2">
                                          <p className="font-bold">{convo.user.name}</p>
                                          {convo.priority === 'crisis' && <span className="bg-red-200 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">crisis</span>}
                                          {convo.priority === 'high' && <span className="bg-yellow-200 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">high</span>}
                                          {convo.priority === 'medium' && <span className="bg-blue-200 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">medium</span>}
                                          <span className="bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-1 rounded-full">{convo.status}</span>
                                      </div>
                                      <p className="text-sm text-gray-700 mt-1">{convo.messages[convo.messages.length - 1].text}</p>
                                      <p className="text-xs text-gray-500 mt-1">{convo.messages.length} messages · {new Date(convo.updatedAt).toLocaleString()}</p>
                                  </div>
                              </div>
                              <Button variant={convo.status === 'active' ? 'secondary' : 'default'}>
                                  {convo.status === 'active' ? 'View' : 'Respond'}
                              </Button>
                          </Card>
                      ))}
                  </div>
                )}
            </div>
          )}

          {activeTab === 'users' && (
            <div>
                <h2 className="text-xl font-bold mb-2">User Management</h2>
                <p className="text-gray-600 mb-6">View and manage all users in the system</p>
                {users.length === 0 ? (
                  <p className="text-gray-500">No users found.</p>
                ) : (
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
                                      <p className="text-xs text-gray-500 mt-1">Joined: {new Date(user.createdAt).toLocaleDateString()} · {user.conversations.length} conversations · Last active: {new Date(user.updatedAt).toLocaleString()}</p>
                                  </div>
                              </div>
                              <Button variant={'outline'}>
                                  View History
                              </Button>
                          </Card>
                      ))}
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModeratorDashboard;
