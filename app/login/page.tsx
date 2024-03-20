'use client'
import Image from "next/image";
import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState({ message: '', status: '' });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Attempting to sign in
    const result = await signIn('credentials', {
      redirect: false, // Prevent default redirect
      username,
      password,
    });

    // Update the login status based on the result
    if (result?.error) {
      setLoginStatus({ message: 'Login failed: Invalid credentials.', status: 'error' });
    } else {
      setLoginStatus({ message: 'Login successful!', status: 'success' });
      // Redirect or perform additional tasks on successful login
      // window.location.href = '/main-page'; // Redirect the user to another page
    }
  };

  return (
    // Define the grid with two rows and center the content in both axes
    <main className="flex flex-col min-h-screen bg-gradient-to-t from-color2 to-color1 justify-between">
      <div className="flex justify-center items-center mt-20">
        <Image
          src="/clubsys-logo.png"
          width={300}
          height={300}
          alt="Clubsys Logo"
        />
      </div>
      <div className="flex flex-col justify-center items-center mb-4">
        <p className="text-3xl font-bold text-color3 mb-10">Log In</p>
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          {/* Username Input */}
          <div>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="bg-color4 text-white mt-1 block w-full px-3 py-3 border border-color4 rounded-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="EkoID"
            />
          </div>

          {/* Password Input */}
          <div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="bg-color4 bg-blend-lighten text-white mt-1 block w-full px-3 py-3 border border-color4 rounded-full shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="bg-gradient-to-r from-color3 to-color1 group relative w-full flex justify-center py-2 px-10 border border-transparent text-sm font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Confirm
          </button>

          {/* Login Feedback Message */}
          {loginStatus.message && (
            <div className={`${loginStatus.status === 'error' ? 'text-red-500' : 'text-green-500'} mt-2 text-center`}>
              {loginStatus.message}
            </div>
          )}
        </form>
      </div>
      <div className="lex justify-center items-center mt-4">
        <p className="text-6xl font-semibold text-white">Welcome to</p>
        <p className="text-6xl font-semibold text-color3">the Club Universe!</p>
      </div>
    </main>
  );
}
