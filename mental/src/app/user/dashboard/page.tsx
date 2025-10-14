'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Heart, Smile, CircleAlert } from 'lucide-react';
import ChatWindow, { Message } from '@/components/chat/ChatWindow';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/components/providers/SocketProvider';

const moderatorInitialMessages: Message[] = [
    {
        id: '1',
        text: "I'd like to speak with a human moderator, please.",
        sender: 'user'
    },
    {
        id: '2',
        text: "I've connected you with a human moderator. Dr. Smith will be with you shortly to provide personalized support.",
        sender: 'system'
    }
];

function UserDashboard() {
    const { user, logout } = useAuth();
    const socket = useSocket();
    const [isModeratorMode, setIsModeratorMode] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [conversationId, setConversationId] = useState<string | null>(null);

    useEffect(() => {
        if (!isModeratorMode && socket) {
            setMessages([]);
            const newConversationId = Math.random().toString(36).substring(2, 15);
            setConversationId(newConversationId);
            socket.emit('joinConversation', newConversationId);

            const handlePreviousMessages = (previousMessages: Message[]) => {
                setMessages(previousMessages);
            };

            const handleReceiveMessage = (message: Message) => {
                setMessages((prevMessages) => [...prevMessages, message]);
            };

            socket.on('previousMessages', handlePreviousMessages);
            socket.on('receiveMessage', handleReceiveMessage);

            return () => {
                socket.off('previousMessages', handlePreviousMessages);
                socket.off('receiveMessage', handleReceiveMessage);
            };
        } else if (isModeratorMode) {
            setMessages(moderatorInitialMessages);
        }
    }, [socket, isModeratorMode]);

    const sendAiMessage = async (text: string) => {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: text, userId: user?.id, conversationId }),
            });

            if (response.ok) {
                const data = await response.json();
                const aiMessage: Message = { id: new Date().toISOString(), text: data.response, sender: 'system' };
                setMessages(prev => [...prev, aiMessage]);
                if (data.conversationId) {
                  setConversationId(data.conversationId)
                }
            } else {
                const errorText = await response.text();
                console.error('Failed to get AI response:', errorText);
            }
        } catch (error) {
            console.error('Error sending message to AI:', error);
        }
    }

    const sendMessage = (text: string) => {
        if (!text.trim()) return;

        const newMessage: Message = { id: new Date().toISOString(), text, sender: 'user' };
        setMessages(prev => [...prev, newMessage]);

        if (isModeratorMode) {
            // Handle moderator mode messaging
        } else {
            sendAiMessage(text);
        }
        
        setInput('');
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Loading...</p>
            </div>
        );
    }
    
    const handleFeelingClick = (feeling: string) => {
        sendMessage(feeling);
    };

    return (
        <div className="flex h-screen bg-gray-100">
          <aside className="w-80 bg-white p-6 border-r border-gray-200 flex flex-col">
            <div className="flex items-center space-x-2 mb-8">
                <img src="/image.png" alt="Mental Health Companion Chatbot" className="w-14 h-14" />
                <div>
                    <h1 className="font-bold text-lg">Mental Health Companion Chatbot</h1>
                    <p className="text-sm text-gray-500">Start a new conversation</p>
                </div>
            </div>

            <div className="my-8">
                <h2 className="font-bold text-lg mb-2">Mental Health Companion</h2>
                <p className="text-sm text-gray-600 mb-4">Your supportive AI companion for mental wellness.</p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start space-x-2">
                    <Heart className="w-5 h-5" />
                    <span>Feeling anxious</span>
                  </Button>
                  <Button variant="outline" className="w-full justify-start space-x-2">
                    <Smile className="w-5 h-5" />
                    <span>Need encouragement</span>
                  </Button>
                  <Button variant="outline" className="w-full justify-start space-x-2">
                    <CircleAlert className="w-5 h-5" />
                    <span>Crisis Support</span>
                  </Button>
                </div>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">How are you feeling today? (Optional)</h3>
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => handleFeelingClick('😊 Great')}>😊 Great</Button>
                    <Button variant="outline" onClick={() => handleFeelingClick('🙂 Good')}>🙂 Good</Button>
                    <Button variant="outline" onClick={() => handleFeelingClick('😐 Okay')}>😐 Okay</Button>
                    <Button variant="outline" onClick={() => handleFeelingClick('😕 Low')}>😕 Low</Button>
                    <Button variant="outline" className="col-span-2" onClick={() => handleFeelingClick('😟 Struggling')}>😟 Struggling</Button>
                </div>
            </div>

            <div className="mt-auto pt-6">
                <Button variant="outline" className="w-full" onClick={() => setIsModeratorMode(true)}>Talk to Human Moderator</Button>
            </div>
          </aside>

          <main className="flex-1 flex flex-col p-6 bg-[#E9F5FD]">
            <header className="flex justify-end items-center mb-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant={isModeratorMode ? 'outline' : 'default'}
                  className={`${isModeratorMode ? 'bg-gray-200 text-black' : 'bg-black text-white'}`}
                  onClick={() => setIsModeratorMode(!isModeratorMode)}>
                  {isModeratorMode ? "Moderator Mode" : "AI Mode"}
                </Button>
                <Button variant="outline" className="bg-white" onClick={logout}>Logout</Button>
              </div>
            </header>

            <div className="flex-1 flex flex-col">
              <ChatWindow 
                messages={messages} 
                input={input} 
                onInputChange={setInput} 
                onSendMessage={() => sendMessage(input)}
                isModeratorMode={isModeratorMode} 
              />
            </div>
          </main>
        </div>
    );
}

export default UserDashboard;
