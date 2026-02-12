import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('chat');
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [savedChats, setSavedChats] = useState([]);
    const [user, setUser] = useState(null);
    const chatEndRef = useRef(null);

    // Persistence: Load history from localStorage
    // Load User and their specific history
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            try {
                const response = await fetch('http://127.0.0.1:8000/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);

                    // Load history specific to this user
                    if (data.email) {
                        const history = localStorage.getItem(`chat_history_${data.email}`);
                        if (history) setSavedChats(JSON.parse(history));
                    }
                }
            } catch (error) {
                console.error("Fetch user error:", error);
            }
        };
        fetchUser();
    }, []);

    // Scroll to bottom when chat updates
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, loading]);

    const handleSignOut = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setChatHistory([]);
        setSavedChats([]);
        navigate('/login');
    };

    const handleAsk = async (e, customMessage = null, systemPrompt = "You are a helpful assistant.") => {
        if (e) e.preventDefault();
        const finalMessage = customMessage || message;
        if (!finalMessage.trim()) return;

        const userMsg = { role: 'user', content: finalMessage, originalContent: finalMessage, timestamp: new Date().toISOString() };
        setChatHistory(prev => [...prev, userMsg]);
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch('http://127.0.0.1:8000/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: finalMessage, system_prompt: systemPrompt }),
            });

            const data = await response.json();
            const aiMsg = { role: 'ai', content: data.response, timestamp: new Date().toISOString() };
            const newHistory = [...chatHistory, userMsg, aiMsg];
            setChatHistory(newHistory);

            // Auto-save session to history if it's new
            // Auto-save session to history if it's new
            if (chatHistory.length === 0) {
                const session = { id: Date.now(), title: finalMessage.substring(0, 30) + '...', messages: newHistory };
                const updatedSavedChats = [session, ...savedChats.slice(0, 19)];
                setSavedChats(updatedSavedChats);
                if (user?.email) {
                    localStorage.setItem(`chat_history_${user.email}`, JSON.stringify(updatedSavedChats));
                }
            } else {
                // Update current session
                const updatedSavedChats = savedChats.map((s, i) => i === 0 ? { ...s, messages: newHistory } : s);
                setSavedChats(updatedSavedChats);
                if (user?.email) {
                    localStorage.setItem(`chat_history_${user.email}`, JSON.stringify(updatedSavedChats));
                }
            }
        } catch (error) {
            console.error("AI Error:", error);
            setChatHistory(prev => [...prev, { role: 'ai', content: "Error: Backend unreachable. Please start the server.", timestamp: new Date().toISOString() }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEdit = async (index) => {
        const updatedHistory = [...chatHistory.slice(0, index)];
        setChatHistory(updatedHistory);
        setEditingIndex(null);
        handleAsk(null, editContent);
    };

    const handleSpecialAction = (type) => {
        let prompt = "You are a helpful assistant.";
        if (type === "Code") prompt = "You are an expert software engineer. Provide high-quality, clean code snippets with explanations.";
        if (type === "Content") prompt = "You are a professional writer. Create engaging, well-structured content for the user.";

        const msg = type === "Code" ? "Generate a React component for a dashboard" : "Write a professional email about project status";
        setMessage(msg);
        handleAsk(null, msg, prompt);
    };

    const loadChatSession = (session) => {
        setChatHistory(session.messages);
        setActiveTab('chat');
    };

    const sidebarItems = [
        { id: 'chat', label: 'New Chat', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" /></svg> },
        { id: 'history', label: 'History', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" /></svg> },
        { id: 'profile', label: 'Profile', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2" strokeLinecap="round" /></svg> },
    ];

    return (
        <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden pt-16">
            {/* Sidebar */}
            <aside className="w-72 bg-[#1e293b]/50 backdrop-blur-xl border-r border-slate-800/50 flex flex-col">
                <div className="p-6">
                    <button onClick={() => { setChatHistory([]); setActiveTab('chat'); }} className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-sky-500/10">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        New Assignment
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
                            {item.icon}
                            <span className="font-semibold">{item.label}</span>
                        </button>
                    ))}

                    {activeTab === 'history' && (
                        <div className="mt-6 space-y-2 animate-in fade-in slide-in-from-left-2">
                            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recent Sessions</p>
                            {savedChats.map((session) => (
                                <button key={session.id} onClick={() => loadChatSession(session)} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800/50 text-sm text-slate-400 hover:text-white truncate transition-all">
                                    {session.title}
                                </button>
                            ))}
                        </div>
                    )}
                </nav>

                <div className="p-6 border-t border-slate-800/50 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 font-bold border border-sky-500/30">
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">{user?.username || 'Guest'}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Pro Plan</p>
                        </div>
                    </div>
                    <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all font-semibold">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
                        Logout
                    </button>
                </div>

            </aside>

            {/* Main Workspace */}
            <main className="flex-1 flex flex-col items-center relative overflow-hidden bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-sky-500/5 via-transparent to-transparent">

                {activeTab === 'profile' ? (
                    <div className="flex-1 w-full max-w-4xl p-12 animate-in fade-in zoom-in-95 duration-500">
                        <div className="glass-card rounded-[3rem] p-12 space-y-12">
                            <div className="flex items-center gap-8">
                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl">
                                    {user?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black text-white tracking-tight">{user?.username || 'User Profile'}</h2>
                                    <p className="text-sky-400 font-bold tracking-widest uppercase text-xs mt-1">Pro Member</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl px-6 py-4 text-white font-medium">
                                        {user?.email || 'N/A'}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Account ID</label>
                                    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl px-6 py-4 text-slate-400 font-mono text-sm">
                                        #USER-{user?.id || '0000'}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-800/50">
                                <h3 className="text-lg font-bold text-white mb-6">Account Settings</h3>
                                <div className="space-y-4">
                                    <button className="w-full text-left px-6 py-4 rounded-2xl bg-slate-800/30 hover:bg-slate-800/50 text-slate-300 transition-all flex items-center justify-between group">
                                        <span className="font-semibold">Security & Password</span>
                                        <svg className="w-5 h-5 text-slate-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    </button>
                                    <button className="w-full text-left px-6 py-4 rounded-2xl bg-slate-800/30 hover:bg-slate-800/50 text-slate-300 transition-all flex items-center justify-between group">
                                        <span className="font-semibold">Billing History</span>
                                        <svg className="w-5 h-5 text-slate-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : chatHistory.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl w-full text-center">
                        <div className="p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 mb-8 animate-pulse">
                            <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <h1 className="text-6xl font-black text-white mb-6 tracking-tight">
                            Build <span className="text-gradient">Something.</span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-lg mb-12">Unleash the power of AI to accelerate your workflow. Start a conversation below.</p>

                        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                            <button onClick={() => handleSpecialAction('Code')} className="glass-card p-6 rounded-3xl hover:border-sky-500/50 transition-all text-left">
                                <h4 className="font-bold text-white mb-1">Generate Code</h4>
                                <p className="text-sm text-slate-500">React components, SQL queries, algorithms</p>
                            </button>
                            <button onClick={() => handleSpecialAction('Content')} className="glass-card p-6 rounded-3xl hover:border-indigo-500/50 transition-all text-left">
                                <h4 className="font-bold text-white mb-1">Write Content</h4>
                                <p className="text-sm text-slate-500">Email drafts, blog posts, technical docs</p>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 w-full max-w-4xl p-8 overflow-y-auto space-y-8 scrollbar-hide">
                        {chatHistory.map((chat, i) => (
                            <div key={i} className={`flex flex-col ${chat.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`relative p-5 rounded-3xl max-w-[85%] shadow-2xl ${chat.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-[#1e293b] text-slate-200 border border-slate-800'}`}>
                                    {editingIndex === i ? (
                                        <div className="space-y-4">
                                            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full bg-slate-900/50 border-none rounded-xl p-3 text-white focus:ring-2 focus:ring-sky-500 outline-none" rows="3" />
                                            <div className="flex justify-end gap-3 text-xs font-bold">
                                                <button onClick={() => setEditingIndex(null)} className="text-slate-400">Cancel</button>
                                                <button onClick={() => handleSaveEdit(i)} className="bg-white text-indigo-600 px-4 py-2 rounded-full">Resend</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-[17px] leading-relaxed whitespace-pre-wrap">{chat.content}</p>
                                            {chat.role === 'user' && (
                                                <button onClick={() => handleEdit(i)} className="absolute -left-12 top-2 p-2 rounded-full hover:bg-slate-800 text-slate-500 transition-all" title="Edit">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex items-center gap-3 text-slate-500 animate-pulse font-medium">
                                <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                                AI is crafting a response...
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                )}

                {/* Unified Input Section */}
                <div className={`w-full max-w-4xl p-8 pb-12 transition-all duration-500 ${activeTab === 'profile' ? 'opacity-0 pointer-events-none translate-y-20' : 'opacity-100'}`}>
                    <form onSubmit={handleAsk} className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-[2.5rem] blur-xl opacity-20 group-focus-within:opacity-40 transition duration-700"></div>
                        <div className="relative flex items-center">
                            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your request here..." className="w-full bg-[#1e293b] border-2 border-slate-800 rounded-[2.5rem] px-8 py-5 focus:outline-none focus:border-sky-500/50 text-white placeholder-slate-600 shadow-2xl resize-none max-h-40" rows="1" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(e); } }} />
                            <button type="submit" disabled={loading || !message.trim()} className="absolute right-3 p-4 bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-[1.75rem] hover:scale-105 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </form>
                </div>

            </main>
        </div>
    );
};

export default Dashboard;