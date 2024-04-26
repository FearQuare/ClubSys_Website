'use client'
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import React from 'react'

const ClubStatistics = () => {
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
    <div>
      <h1 className='font-semibold text-3xl bg-gradient-to-t from-color3 to-color4 text-gradient basis-2/5 pl-20 mt-10'>Clubs Satistics</h1>
    </div>
  )
}

export default ClubStatistics