import React, { useState } from 'react';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Creating account...' });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus({ type: 'success', message: 'Account created successfully!' });
        setFormData({ email: '', password: '' }); // Reset form
      } else {
        const errorData = await response.json();
        setStatus({ type: 'error', message: errorData.detail || 'Signup failed.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Could not connect to the server.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Sign Up</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your details to get started</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Sign Up
            </button>
          </div>

          {status.message && (
            <div className={`mt-4 text-center text-sm p-2 rounded ${status.type === 'success' ? 'bg-green-100 text-green-700' :
              status.type === 'error' ? 'bg-red-100 text-red-700' : 'text-gray-500'
              }`}>
              {status.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SignupPage;