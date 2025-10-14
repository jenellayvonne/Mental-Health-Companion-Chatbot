'use client';

import { Send } from 'lucide-react';

export interface Message {
  id: string;
  text: string;
  sender: string;
  isOptimistic?: boolean;
}

interface ChatWindowProps {
  messages: Message[];
  input: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  isModeratorMode: boolean;
}

export default function ChatWindow({ messages, input, onInputChange, onSendMessage, isModeratorMode }: ChatWindowProps) {

  const renderChatContent = () => {
      const messageList = messages.map((msg) => (
        <div
          key={msg.id}
          className={`p-3 my-2 rounded-lg max-w-lg ${
            msg.sender === 'user'
              ? 'bg-blue-500 text-white ml-auto'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          <p className="text-sm">{msg.text}</p>
        </div>
      ));

      if (!isModeratorMode && messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto">
                <h2 className="text-2xl font-bold mb-4">Welcome to Your Mental Health Companion</h2>
                <p className="text-gray-600 mb-4">I'm here to provide support, listen to your concerns, and help you navigate your mental wellness journey. Feel free to share what's on your mind.</p>
                <ul className="list-disc list-inside text-gray-600">
                  <li>Share your feelings and thoughts</li>
                  <li>Track your daily mood</li>
                  <li>Get coping strategies and support</li>
                  <li>Access crisis resources when needed</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto mt-4">
                <h3 className="text-xl font-bold mb-2">AI Companion</h3>
                <p className="text-gray-600">Welcome to Your Mental Health Companion! I'm here to provide support, listen to your concerns, and help you navigate your mental wellness journey. Feel free to share what's on your mind.</p>
              </div>
            </div>
        )
      }
      return messageList;

  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-4 h-full">
            {renderChatContent()}
        </div>
      </div>
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center bg-gray-100 rounded-lg p-2">
            <input
              type="text"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
              className="flex-1 bg-transparent outline-none text-gray-700"
              placeholder={isModeratorMode ? "Message Dr. Smith..." : "Share what's on your mind... I'm here to listen and support you."}
            />
            <button
              onClick={onSendMessage}
              className="ml-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
}
