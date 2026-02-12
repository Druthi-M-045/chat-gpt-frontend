import React, { useState } from 'react';

const AskAI = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message to UI immediately
    const userMsg = { role: 'user', content: message };
    setChatHistory(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // If your /ask route is protected, include the token:
          // 'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          message: message,
          system_prompt: "You are a helpful assistant." // Matches your payload schema
        }),
      });

      const data = await response.json();
      
      // Add AI response to UI
      setChatHistory(prev => [...prev, { role: 'ai', content: data.response }]);
      setMessage(''); // Clear input
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col h-[600px] bg-white shadow-xl rounded-xl">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 border-b">
        {chatHistory.map((chat, i) => (
          <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-[80%] ${
              chat.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'
            }`}>
              {chat.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-sm text-gray-500 animate-pulse">AI is typing...</div>}
      </div>

      <form onSubmit={handleAsk} className="p-4 flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask something..."
          className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <button 
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default AskAI;