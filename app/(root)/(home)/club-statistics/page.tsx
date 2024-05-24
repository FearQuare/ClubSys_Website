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
      <h1 className='font-semibold text-3xl bg-gradient-to-t from-color3 to-color4 text-gradient'>Clubs Satistics</h1>
      <div className='flex flex-row'>
        <div className='flex flex-col'>
          <div
            className='rounded-3xl bg-color5 text-center pt-2 pb-6 p-36 cursor-pointer'
          >
            <p className='mt-5 text-color6 text-lg font-bold'>Total Number of Students</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClubStatistics