'use client'
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import React from 'react'

const Notifications = () => {
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
    <div className='pl-20 mt-10'>
      <h1 className='font-semibold text-3xl bg-gradient-to-t from-color3 to-color4 text-gradient basis-2/5'>Notifications</h1>
      <div className='flex flex-row'>Create Notification</div>
      <div className='flex flex-row'>Upcoming Events Without Documents</div>
      <div className='flex flex-row'>Received Notifications</div>
    </div>
  )
}

export default Notifications