import React, { useState, useEffect } from 'react';

const AskAI = () => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    // 1. Load user and history on mount (only if token exists)
    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return; // Guest mode - skip history loading

            try {
                // Get user info to identify history key
                const userRes = await fetch(`${import.meta.env.VITE_API_BASE}/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData);

                    // Load from localStorage first for speed
                    const localHist = localStorage.getItem(`chat_history_${userData.email}`);
                    if (localHist) {
                        setChatHistory(JSON.parse(localHist));
                    }

                    // Then fetch from backend to sync
                    const histRes = await fetch(`${import.meta.env.VITE_API_BASE}/history`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (histRes.ok) {
                        const backendHist = await histRes.json();
                        const transformed = [];
                        backendHist.forEach(item => {
                            transformed.push({ role: 'user', content: item.input_text });
                            transformed.push({ role: 'ai', content: item.output_text });
                        });
                        setChatHistory(transformed);
                        localStorage.setItem(`chat_history_${userData.email}`, JSON.stringify(transformed));
                    }
                }
            } catch (err) {
                console.error("Initialization error:", err);
            }
        };
        init();
    }, []);

    const handleAsk = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const token = localStorage.getItem('access_token');
        const userMsg = { role: 'user', content: message };
        const updatedHistory = [...chatHistory, userMsg];

        setChatHistory(updatedHistory);
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE}/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                    message: message,
                    system_prompt: "You are a helpful assistant."
                }),
            });

            const data = await response.json();

            if (response.ok) {
                const aiMsg = { role: 'ai', content: data.response };
                const finalHistory = [...updatedHistory, aiMsg];
                setChatHistory(finalHistory);

                // Sync to localStorage only if user is logged in
                if (user?.email) {
                    localStorage.setItem(`chat_history_${user.email}`, JSON.stringify(finalHistory));
                }
            } else {
                console.error("AI Error:", data.detail);
            }
        } catch (error) {
            console.error("AI Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 flex flex-col h-[600px] bg-white shadow-xl rounded-xl mt-10">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 border-b">
                {chatHistory.length === 0 && !loading && (
                    <div className="text-center text-gray-400 mt-20">
                        {user ? "No history yet. Start a conversation!" : "Guest mode: Chat is ephemeral."}
                    </div>
                )}
                {chatHistory.map((chat, i) => (
                    <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-lg max-w-[80%] ${chat.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {chat.content}
                        </div>
                    </div>
                ))}
                {loading && <div className="text-sm text-gray-500 animate-pulse text-left">AI is typing...</div>}
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
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    disabled={loading || !message.trim()}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default AskAI;
