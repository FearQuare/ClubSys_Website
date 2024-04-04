'use client'
import { signOut, useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import React from 'react';

export default function Home() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className='p-8'>
      <div>UID: {session?.user?.uid}</div>
      <div>Email: {session?.user?.email}</div>
      <button onClick={() => signOut()}>Logout</button>
    </div>
  );
}

Home.requireAuth = true;
