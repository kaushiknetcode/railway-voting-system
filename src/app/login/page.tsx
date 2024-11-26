'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Define all users
const USERS = {
  // Admin
  'admin': { password: 'admin123', role: 'admin', unit: 'all' },
  
  // Asansol Division
  'asansol_po': { password: 'po123', role: 'po', unit: 'Asansol Division' },
  'asansol_apo': { password: 'apo123', role: 'apo', unit: 'Asansol Division' },
  
  // Sealdah Division
  'sealdah_po': { password: 'po123', role: 'po', unit: 'Sealdah Division' },
  'sealdah_apo': { password: 'apo123', role: 'apo', unit: 'Sealdah Division' },
  
  // Howrah Division
  'howrah_po': { password: 'po123', role: 'po', unit: 'Howrah Division' },
  'howrah_apo': { password: 'apo123', role: 'apo', unit: 'Howrah Division' },
  
  // Malda Division
  'malda_po': { password: 'po123', role: 'po', unit: 'Malda Division' },
  'malda_apo': { password: 'apo123', role: 'apo', unit: 'Malda Division' },
  
  // Headquarter
  'hq_po': { password: 'po123', role: 'po', unit: 'Headquarter' },
  'hq_apo': { password: 'apo123', role: 'apo', unit: 'Headquarter' },
  
  // Kanchrapara Workshop
  'kw_po': { password: 'po123', role: 'po', unit: 'Kanchrapara Workshop' },
  'kw_apo': { password: 'apo123', role: 'apo', unit: 'Kanchrapara Workshop' },
  
  // Liluah Workshop
  'lw_po': { password: 'po123', role: 'po', unit: 'Liluah Workshop' },
  'lw_apo': { password: 'apo123', role: 'apo', unit: 'Liluah Workshop' },
  
  // Jamalpur Workshop
  'jw_po': { password: 'po123', role: 'po', unit: 'Jamalpur Workshop' },
  'jw_apo': { password: 'apo123', role: 'apo', unit: 'Jamalpur Workshop' }
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = USERS[username];
    if (user && user.password === password) {
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify({
        username,
        role: user.role,
        unit: user.unit
      }));
      router.push('/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white shadow-lg rounded-lg px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Eastern Railway
          </h1>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Secret Ballot Election 2024
          </h1>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Admin Panel
          </h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label 
                htmlFor="username" 
                className="block text-sm font-medium text-gray-900"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm text-gray-900"
                required
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-900"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm text-gray-900"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}