'use client';

import { useState, useContext } from 'react';
import { Button } from '@/components/ui/Button';
import { Bot, Smile, Frown, Meh, Heart, CircleAlert } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import ChatWindow from '@/components/chat/ChatWindow';

const UserDashboard = () => {
  const [mood, setMood] = useState('');
  const [isModeratorMode, setIsModeratorMode] = useState(false);

  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }
  const { logout } = auth;

  const handleModeratorRequest = () => {
    setIsModeratorMode(true);
    // You can add logic here to switch the chat to a moderator
  };

  const handleMoodSelection = (selectedMood: string) => {
    setMood(selectedMood);
  };

  return (
    <div className="flex h-screen bg-[#F0F4F8] font-sans">
      <aside className="w-1/4 p-6 bg-white flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <Bot className="text-blue-500 w-8 h-8" />
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
            <h3 className="font-semibold mb-2 text-sm">How are you feeling today? (Optional)</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant={mood === 'Great' ? "secondary" : "outline"} className="flex items-center justify-center space-x-2" onClick={() => handleMoodSelection('Great' )}><Smile className="w-5 h-5" /><span>Great</span></Button>
              <Button variant={mood === 'Good' ? "secondary" : "outline"} className="flex items-center justify-center space-x-2" onClick={() => handleMoodSelection('Good' )}><Smile className="w-5 h-5" /><span>Good</span></Button>
              <Button variant={mood === 'Okay' ? "secondary" : "outline"} className="flex items-center justify-center space-x-2" onClick={() => handleMoodSelection('Okay' )}><Meh className="w-5 h-5" /><span>Okay</span></Button>
              <Button variant={mood === 'Low' ? "secondary" : "outline"} className="flex items-center justify-center space-x-2" onClick={() => handleMoodSelection('Low' )}><Frown className="w-5 h-5" /><span>Low</span></Button>
              <Button variant={mood === 'Struggling' ? "secondary" : "outline"} className="flex items-center justify-center space-x-2 col-span-2" onClick={() => handleMoodSelection('Struggling' )}><Frown className="w-5 h-5" /><span>Struggling</span></Button>
            </div>
          </div>
        </div>
        {!isModeratorMode && (
            <Button variant="secondary" className="w-full" onClick={handleModeratorRequest}>Talk to Human Moderator</Button>
        )}
      </aside>

      <main className="flex-1 flex flex-col p-6 bg-[#E9F5FD]">
        <header className="flex justify-end items-center mb-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="bg-white">{isModeratorMode ? "Moderator Mode" : "AI Mode"}</Button>
            <Button variant="outline" className="bg-white" onClick={logout}>Logout</Button>
          </div>
        </header>

        <div className="flex-1 flex flex-col">
          <ChatWindow />
        </div>
      </main>
    </div>
  );
}
export default UserDashboard;
