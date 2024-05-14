'use client'
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { Notification } from '@/types/firestore'; 

const Notifications = () => {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/notifications'); // Adjust the URL if your API route differs
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className='pl-20 mt-10'>
      <h1 className='font-semibold text-3xl bg-gradient-to-t from-color3 to-color4 text-gradient basis-2/5'>Notifications</h1>
      <div className='flex flex-row'>
        <div className="flex flex-col min-w-full">
          <h1 className='mt-2 text-2xl font-semibold text-orange-500'>Received Notifications</h1>
          <div className="mt-4 relative overflow-x-auto shadow-md sm:rounded-lg" style={{ width: '97%'}}>
            <table className="w-full text-sm text-left rtl:text-right text-blue-500 dark:text-blue-400">
              <thead className="text-xs text-cyan-500 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    From
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Message
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Related Document
                  </th>
                </tr>
              </thead>
              <tbody>
                {notifications.map(notification => (
                  <tr key={notification.id} className='odd:bg-blue-500 odd:text-blue-50 even:bg-blue-50 even:text-blue-500'>
                    <td className="px-6 py-4">{notification.senderID}</td>
                    <td className="px-6 py-4">Empty</td>
                    <td className="px-6 py-4">{notification.message}</td>
                    <td className="px-6 py-4">{notification.documentURL}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className='flex flex-row'>Upcoming Events Without Documents</div>
      <div className='flex flex-row'>Create Notification</div>
    </div>
  )
}

export default Notifications