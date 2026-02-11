import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: 'User', email: '' });

    useEffect(() => {
        // Simple authentication check
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
        }
        // In a real app, you'd fetch user data here
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    const stats = [
        { label: 'Total Projects', value: '12', icon: '📁', color: 'bg-blue-500' },
        { label: 'Active Tasks', value: '5', icon: '⚡', color: 'bg-green-500' },
        { label: 'Messages', value: '3', icon: '✉️', color: 'bg-purple-500' },
        { label: 'Credits', value: '450', icon: '💎', color: 'bg-yellow-500' },
    ];

    const activities = [
        { id: 1, text: 'Logged in from a new device', time: '2 mins ago' },
        { id: 2, text: 'Completed "Project Alpha" milestones', time: '1 hour ago' },
        { id: 3, text: 'Password changed successfully', time: 'Yesterday' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-indigo-900 text-white flex flex-col">
                <div className="p-6 text-2xl font-bold border-b border-indigo-800 flex items-center gap-2">
                    <span className="text-3xl">🚀</span> DashVite
                </div>
                <nav className="flex-grow p-4 space-y-2">
                    <a href="#" className="block p-3 rounded bg-indigo-800 text-white font-medium">Dashboard</a>
                    <a href="#" className="block p-3 rounded hover:bg-indigo-800 transition">Analytics</a>
                    <a href="#" className="block p-3 rounded hover:bg-indigo-800 transition">Settings</a>
                </nav>
                <div className="p-6 border-t border-indigo-800">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-600 hover:bg-red-700 p-2 rounded font-semibold transition flex items-center justify-center gap-2"
                    >
                        <span>🚪</span> Logout
                    </button>

                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-8">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Welcome Back, {user.name}!</h1>
                        <p className="text-gray-500 mt-1">Here is what is happening with your account today.</p>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
                            <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h3>
                        <div className="space-y-6">
                            {activities.map(activity => (
                                <div key={activity.id} className="flex gap-4 items-start pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2"></div>
                                    <div className="flex-grow">
                                        <p className="text-gray-800 font-medium">{activity.text}</p>
                                        <p className="text-sm text-gray-400 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Tools */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Tools</h3>
                        <div className="space-y-4">
                            <button className="w-full text-left p-4 rounded-lg border border-indigo-50 hover:bg-indigo-50 transition font-medium text-indigo-700">
                                📊 Generate Report
                            </button>
                            <button className="w-full text-left p-4 rounded-lg border border-indigo-50 hover:bg-indigo-50 transition font-medium text-indigo-700">
                                🛠️ Account Audit
                            </button>
                            <button className="w-full text-left p-4 rounded-lg border border-indigo-50 hover:bg-indigo-50 transition font-medium text-indigo-700">
                                🔑 security Check
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;