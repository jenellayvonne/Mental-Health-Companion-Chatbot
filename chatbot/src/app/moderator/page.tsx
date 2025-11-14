'use client';

import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

type SocketType = ReturnType<typeof io>;
type Message = { id: string; sender: string; text: string; room: string; username?: string };
type ChatPreview = { id: string; user: string; msg: string };

export default function ModeratorDashboard() {
  const socketRef = useRef<SocketType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [recentChats, setRecentChats] = useState<ChatPreview[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const currentRoomRef = useRef<string | null>(null);
  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const setupSocket = async () => {
      await fetch('/api/socket');
      const newSocket = io({ path: '/api/socket', transports: ['websocket'] });
      socketRef.current = newSocket;

      newSocket.on('connect', () => {
        console.log('✅ Moderator connected:', newSocket.id);
        newSocket.emit('register_moderator');
        fetchInitialData();
      });

      newSocket.on('load_messages', (msgs: Message[]) => {
        console.log('📜 Loaded previous messages:', msgs);
        setMessages(msgs);
      });

      // This listener ONLY handles messages for the *active* chat window
      newSocket.on('receive_message', (data: Message) => {
        console.log('📨 Received message for active chat:', data);
        if (data.room === currentRoomRef.current) {
          setMessages((prev) => [...prev, data]);
        }
      });

      // This listener ONLY handles the list of recent chats on the left
      newSocket.on('new_chat_message', (data: { room: string; username: string; msg: string }) => {
        console.log('🆕 New chat notification for dashboard:', data);
        setRecentChats((prev) => {
          const chatExists = prev.some((chat) => chat.id === data.room);
          if (chatExists) {
            // If chat exists, update its message and move to top
            const updatedChat = { id: data.room, user: data.username, msg: data.msg };
            const otherChats = prev.filter((chat) => chat.id !== data.room);
            return [updatedChat, ...otherChats];
          } else {
            // If new chat, add it to the top of the list
            return [{ id: data.room, user: data.username, msg: data.msg }, ...prev];
          }
        });
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Moderator disconnected');
      });
    };

    const fetchInitialData = async () => {
      try {
        const res = await fetch('/api/chats');
        if (res.ok) {
          const data = await res.json();
          setRecentChats(data);
        } else {
          console.error('Failed to fetch chats with status:', res.status);
        }
      } catch (error) {
        console.error('❌ Failed to fetch chats:', error);
      }

      const savedRoom = localStorage.getItem('lastRoom');
      const savedUser = localStorage.getItem('lastUser');
      if (savedRoom && savedUser) {
        joinRoom(savedRoom, savedUser);
      }
    };

    setupSocket();

    return () => {
      if (socketRef.current) {
        console.log('🔌 Disconnecting moderator socket...');
        socketRef.current.disconnect();
      }
    };
  }, []);

  const joinRoom = (room: string, username: string) => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.warn("Socket not ready for joining room");
      return;
    }
    if (currentRoom === room) return;

    if (currentRoom) {
      socketRef.current.emit('leave_room', currentRoom);
      console.log(`🏃 Leaving room: ${currentRoom}`);
    }

    setCurrentRoom(room);
    setSelectedUser(username);
    setMessages([]);
    localStorage.setItem('lastRoom', room);
    localStorage.setItem('lastUser', username);

    socketRef.current.emit('join_room', { roomId: room, username: 'Dr. Moody' });
    console.log(`🩺 Joining room: ${room}`);
  };

  const handleSend = () => {
    if (!input.trim() || !currentRoom || !socketRef.current) return;
    const newMsg = {
      sender: 'moderator',
      text: input,
      room: currentRoom,
      username: 'Dr. Moody',
    };

    socketRef.current.emit('send_message', newMsg);
    setInput('');
  };

  const handleLogout = () => {
    window.location.href = '/';
  };

  return (
    <div className='flex h-screen bg-gray-100'>
      <div className='w-1/3 bg-white border-r flex flex-col'>
        <h2 className='text-xl font-bold text-center py-4 bg-blue-800 text-white flex items-center justify-center'>
          Dr. Moody Clients
        </h2>
        <div className='flex-1 overflow-y-auto'>
          {recentChats.length === 0 ? (
            <p className='text-center text-gray-500 mt-6'>No active chats yet.</p>
          ) : (
            <ul>
              {recentChats.map((chat) => (
                <li
                  key={chat.id}
                  onClick={() => joinRoom(chat.id, chat.user)}
                  className={`p-3 border-b cursor-pointer hover:bg-blue-200 ${
                    currentRoom === chat.id ? 'bg-blue-300' : ''
                  }`}>
                  <p className='font-semibold'>{chat.user}</p>
                  <p className='text-sm text-gray-600 truncate'>{chat.msg}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className='p-4'>
          <button
            onClick={handleLogout}
            className='w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'>
            Logout
          </button>
        </div>
      </div>

      <div className='flex-1 flex flex-col'>
        {currentRoom ? (
          <>
            <div className='bg-white shadow p-4 flex justify-between items-center'>
              <h2 className='font-bold text-lg text-blue-900'>
                Chat with {selectedUser}
              </h2>
              <p className='text-gray-500 text-sm'>
                Room ID: <span className='font-mono'>{currentRoom}</span>
              </p>
            </div>

            <div className='flex-1 overflow-y-auto p-4 space-y-2'>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.sender === 'moderator' ? 'justify-end' : 'justify-start'
                  }`}>
                  <div
                    className={`px-3 py-2 rounded-lg max-w-[75%] ${
                      m.sender === 'moderator'
                        ? 'bg-green-300 text-gray-800'
                        : 'bg-blue-500 text-white'
                    }`}>
                    <p className='text-sm'>{m.text}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef}></div>
            </div>

            <div className='bg-white p-4 flex gap-2 border-t'>
              <input
                type='text'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder='Type your message...'
                className='flex-grow border p-2 rounded-lg'
              />
              <button
                onClick={handleSend}
                className='bg-blue-800 text-white px-4 py-2 rounded-lg'>
                Send
              </button>
            </div>
          </>
        ) : (
          <div className='flex flex-col items-center justify-center h-full text-gray-500'>
            <p className='text-lg font-medium'>Select a user chat to begin 🧠</p>
          </div>
        )}
      </div>
    </div>
  );
}