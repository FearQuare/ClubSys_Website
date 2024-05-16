'use client'
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import React from 'react';
import ClubBoxes from '@/components/ClubBoxes';
export default function Home() {
  useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  return (
    <>
      <h1 className='font-semibold text-3xl bg-gradient-to-t from-color3 to-color4 text-gradient basis-2/5'>Clubs & Teams</h1>
      <div className='mt-4'>
        <ClubBoxes />
      </div>
    </>
  );
}

Home.requireAuth = true;
