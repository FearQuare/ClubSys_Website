'use client';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { Notification, Club, Events, Document } from '@/types/firestore';

const Notifications = () => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<Events[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    const fetchClubs = async () => {
      try {
        const response = await fetch('/api/clubs');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setClubs(data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/documents');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setDocuments(data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchNotifications();
    fetchClubs();
    fetchEvents();
    fetchDocuments();
  }, []);

  const getClubName = (clubID: string) => {
    const club = clubs.find((club) => club.id === clubID);
    return club ? club.clubName : 'Unknown Club';
  }

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  const getEventsWithoutDocument = () => {
    const documentEventIDs = new Set(documents.map(document => document.eventID));

    const eventsWithoutDocuments = events.filter(event => !documentEventIDs.has(event.id));

    return (
      <>
        {eventsWithoutDocuments.length > 0 ? (
          eventsWithoutDocuments.map(event => (
            <tr key={event.id} className='odd:bg-blue-500 odd:text-blue-50 even:bg-blue-50 even:text-blue-500'>
              <td className="px-6 py-4">{event.eventName}</td>
              <td className="px-6 py-4">{getClubName(event.clubID)}</td>
              <td className="px-6 py-4">Date</td>
              <td className="px-6 py-4">{event.isApproved == null ? 'Pending' : 'Rejected'}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td className="px-6 py-4 text-center" colSpan={5}>No data yet.</td>
          </tr>
        )}
      </>
    );
}



  return (
    <div className='pl-20 mt-10'>
      <h1 className='font-semibold text-3xl bg-gradient-to-t from-color3 to-color4 text-gradient basis-2/5'>Notifications</h1>
      <div className='flex flex-row'>
        <div className="flex flex-col min-w-full">
          <h1 className='mt-5 text-2xl font-semibold text-orange-500'>Received Notifications</h1>
          <div className="mt-4 relative overflow-x-auto shadow-md sm:rounded-lg" style={{ width: '97%' }}>
            <table className="w-full text-sm text-left rtl:text-right">
              <thead className="text-xs text-blue-500 uppercase bg-blue-50">
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
                  <th scope="col" className="px-6 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {notifications.map(notification => (
                  <tr key={notification.id} className='odd:bg-blue-500 odd:text-blue-50 even:bg-blue-50 even:text-blue-500'>
                    <td className="px-6 py-4">{getClubName(notification.senderID)}</td>
                    <td className="px-6 py-4">Empty</td>
                    <td className="px-6 py-4">{notification.message}</td>
                    <td className="px-6 py-4">{notification.documentURL}</td>
                    <td className="px-6 py-4">{notification.status ? 'Read' : 'Unread'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className='flex flex-row'>
        <div className='flex flex-col min-w-full'>
          <h1 className='mt-5 text-2xl font-semibold text-orange-500'>Upcoming Events Without Documents</h1>
          <div className="mt-4 relative overflow-x-auto shadow-md sm:rounded-lg" style={{ width: '97%' }}>
            <table className="w-full text-sm text-left rtl:text-right">
              <thead className="text-xs text-blue-500 uppercase bg-blue-50">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Event Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Club
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Event Date
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Send Notification
                  </th>
                </tr>
              </thead>
              <tbody>
                {getEventsWithoutDocument()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className='flex flex-row'>
        <div className='flex flex-col min-w-full'>
          <h1 className='mt-5 text-2xl font-semibold text-orange-500'>Create Notification</h1>
        </div>
      </div>
    </div>
  )
}

export default Notifications