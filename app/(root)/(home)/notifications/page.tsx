'use client';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { Notification, Club, Events, Document } from '@/types/firestore';
import { format } from 'date-fns';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebaseConfig';
import { v4 as uuidv4 } from 'uuid';

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
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ascending' | 'descending' }>({ key: '', direction: 'ascending' });
  const [popupMessage, setPopupMessage] = useState<{ message: string, success: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState('No documents selected');
  const [selectedClubID, setSelectedClubID] = useState('');
  const [message, setMessage] = useState('');
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<{ clubID?: string, message?: string }>({});

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

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setFileName(file.name);
      setFileUpload(file);
    } else {
      setFileName('No documents selected');
      setFileUpload(null);
    }
  };

  const getClubName = (clubID: string) => {
    const club = clubs.find((club) => club.id === clubID);
    return club ? club.clubName : 'Unknown Club';
  };

  const sortData = <T,>(data: T[], key: keyof T): T[] => {
    let sortedData = [...data];
    const direction = sortConfig.direction === 'ascending' ? 1 : -1;

    sortedData.sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (key === 'date' || key === 'eventDate') {
        const aDate = new Date((aValue as any)._seconds * 1000);
        const bDate = new Date((bValue as any)._seconds * 1000);
        return (aDate.getTime() - bDate.getTime()) * direction;
      } else {
        if (aValue < bValue) return -1 * direction;
        if (aValue > bValue) return 1 * direction;
        return 0;
      }
    });

    setSortConfig({ key: key as string, direction: sortConfig.direction === 'ascending' ? 'descending' : 'ascending' });
    return sortedData;
  };

  const requestSort = (key: string) => {
    let sortedNotifications = notifications;
    let sortedEvents = events;
    switch (key) {
      case 'senderID':
      case 'receiverID':
      case 'date':
      case 'message':
      case 'documentURL':
      case 'status':
        sortedNotifications = sortData(notifications, key as keyof Notification);
        break;
      case 'eventName':
      case 'clubID':
      case 'eventDate':
      case 'isApproved':
        sortedEvents = sortData(events, key as keyof Events);
        break;
    }
    setNotifications(sortedNotifications);
    setEvents(sortedEvents);
  };

  const handleSendNotification = async (clubID: string, eventDate: { _seconds: number }, eventName: string) => {
    const currentDate = new Date();
    const eventDateObj = new Date(eventDate._seconds * 1000);
    const daysLeft = Math.ceil((eventDateObj.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) - 15;

    const message = `${daysLeft} days left for the last day of approval of ${eventName}. Please send the event request document.`;
    const notification = {
      senderID: 'HCS',
      receiverID: clubID,
      message,
      date: currentDate
    };

    try {
      await addDoc(collection(db, 'Notifications'), notification);
      setPopupMessage({ message: 'The message successfully sent', success: true });
    } catch (error) {
      setPopupMessage({ message: 'The notification failed', success: false });
    } finally {
      setTimeout(() => setPopupMessage(null), 3000);
    }
  };

  const handleChangeStatus = async (notificationId: string, currentStatus: boolean) => {
    try {
      const notificationRef = doc(db, 'Notifications', notificationId);
      await updateDoc(notificationRef, {
        status: !currentStatus
      });
      window.location.reload();
    } catch (error) {
      console.error('Failed to update status:', error);
      setPopupMessage({ message: 'Failed to update status', success: false });
      setTimeout(() => setPopupMessage(null), 3000);
    }
  };
  

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  const getEventsWithoutDocument = () => {
    const documentEventIDs = new Set(documents.map(document => document.eventID));
    const now = new Date();
    const fifteenDaysFromNow = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

    const eventsWithoutDocuments = events.filter(event => {
      const eventDate = new Date(event.eventDate._seconds * 1000);
      return !documentEventIDs.has(event.id) && eventDate >= fifteenDaysFromNow && eventDate > now;
    });

    return (
      <>
        {eventsWithoutDocuments.length > 0 ? (
          eventsWithoutDocuments.map(event => (
            <tr key={event.id} className='odd:bg-blue-500 odd:text-blue-50 even:bg-blue-50 even:text-blue-500'>
              <td className="px-6 py-4">{event.eventName}</td>
              <td className="px-6 py-4">{getClubName(event.clubID)}</td>
              <td className="px-6 py-4">{format(new Date(event.eventDate._seconds * 1000), 'PPpp')}</td>
              <td className="px-6 py-4">{event.isApproved == null ? 'Pending' : 'Rejected'}</td>
              <td className='px-6 py-4'>
                <button
                  className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 px-4 border-b-4 border-orange-700 hover:border-orange-500 rounded"
                  onClick={() => handleSendNotification(event.clubID, event.eventDate, event.eventName)}
                >
                  Request
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td className="px-6 py-4 text-center" colSpan={5}>No data yet.</td>
          </tr>
        )}
      </>
    );
  };

  const renderSortArrow = (key: string) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? '↑' : '↓';
    }
    return '';
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    let errors: { clubID?: string, message?: string } = {};

    if (!selectedClubID) {
      errors.clubID = 'You should select a club.';
    }
    if (!message) {
      errors.message = 'You should enter a message.';
    }

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        let fileURL = null;
        if (fileUpload) {
          const fileRef = ref(storage, `Documents/${selectedClubID}/${fileUpload.name}-${uuidv4()}`);
          const snapshot = await uploadBytes(fileRef, fileUpload);
          fileURL = await getDownloadURL(snapshot.ref);

          await addDoc(collection(db, 'Documents'), {
            clubID: selectedClubID,
            dateTime: serverTimestamp(),
            fileName: fileUpload.name,
            fileURL: fileURL,
            filePath: fileRef.fullPath
          });
        }

        await addDoc(collection(db, 'Notifications'), {
          senderID: 'HCS',
          receiverID: selectedClubID,
          message: message,
          documentURL: fileURL || '',
          date: serverTimestamp()
        });

        setPopupMessage({ message: 'Notification sent successfully', success: true });
      } catch (error) {
        setPopupMessage({ message: 'Notification couldn\'t be sent', success: false });
      } finally {
        setTimeout(() => setPopupMessage(null), 3000);
      }
    }
  };

  return (
    <div>
      <h1 className='font-semibold text-3xl bg-gradient-to-t from-color3 to-color4 text-gradient basis-2/5'>Notifications</h1>
      <form onSubmit={handleSubmit} className='flex flex-row'>
        <div className='flex flex-col'>
          <h1 className='mt-5 text-2xl font-semibold text-orange-500'>Create Notification</h1>
          <label htmlFor="clubs" className='block mb-2 text-sm font-medium text-gray-900 mt-1'>Select the club</label>
          <select
            name="clubs"
            id="clubs"
            className={`bg-blue-50 border ${formErrors.clubID ? 'border-red-500' : 'border-blue-300'} text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5`}
            value={selectedClubID}
            onChange={(e) => setSelectedClubID(e.target.value)}
          >
            <option value="">Select a club</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.clubName}
              </option>
            ))}
          </select>
          {formErrors.clubID && <p className="text-red-500 text-xs mt-1">{formErrors.clubID}</p>}
        </div>
        <div className='flex flex-col mt-10 ml-6 min-w-64'>
          <label htmlFor="message" className='block mb-2 text-sm font-medium text-gray-900 mt-4'>Please enter your message</label>
          <textarea
            rows={1}
            name="message"
            id="message"
            placeholder='Enter your message here'
            className={`block p-2.5 w-full text-sm text-gray-900 bg-blue-50 rounded-lg border ${formErrors.message ? 'border-red-500' : 'border-blue-300'} focus:ring-orange-500 focus:border-orange-500`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
          {formErrors.message && <p className="text-red-500 text-xs mt-1">{formErrors.message}</p>}
        </div>
        <div className='flex flex-col mt-14 ml-6'>
          <label htmlFor="document-upload" className='block mb-2 text-sm font-medium text-gray-900'>
            {"Upload the document (optional)"}
          </label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={handleButtonClick}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
            >
              Select Document
            </button>
            <span id="file-name" className='mt-2 text-sm text-gray-500 pb-2 pl-2'>{fileName}</span>
            <input
              ref={fileInputRef}
              id="document-upload"
              type="file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>
        <div className='flex flex-col mt-16 ml-10'>
          <button type='submit' className='min-w-64 mt-4 bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 px-4 border-b-4 border-orange-700 hover:border-orange-500 rounded-xl'>Submit</button>
        </div>
      </form>
      <div className='flex flex-row'>
        <div className="flex flex-col min-w-full">
          <h1 className='mt-5 text-2xl font-semibold text-orange-500'>Received Notifications</h1>
          <div className="mt-4 relative overflow-x-auto shadow-md sm:rounded-lg" style={{ width: '97%' }}>
            <table className="w-full text-sm text-left rtl:text-right">
              <thead className="text-xs text-blue-500 uppercase bg-blue-50">
                <tr>
                  <th scope="col" className="px-6 py-3" onClick={() => requestSort('senderID')}>
                    From {renderSortArrow('senderID')}
                  </th>
                  <th scope="col" className="px-6 py-3" onClick={() => requestSort('date')}>
                    Date {renderSortArrow('date')}
                  </th>
                  <th scope="col" className="px-6 py-3" onClick={() => requestSort('message')}>
                    Message {renderSortArrow('message')}
                  </th>
                  <th scope="col" className="px-6 py-3" onClick={() => requestSort('documentURL')}>
                    Related Document {renderSortArrow('documentURL')}
                  </th>
                  <th scope="col" className="px-6 py-3" onClick={() => requestSort('status')}>
                    Status {renderSortArrow('status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {notifications
                  .filter(notification => notification.senderID !== 'HCS').length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">No data to display</td>
                  </tr>
                ) : (
                  notifications
                    .filter(notification => notification.senderID !== 'HCS')
                    .map(notification => (
                      <tr key={notification.id} className='odd:bg-blue-500 odd:text-blue-50 even:bg-blue-50 even:text-blue-500'>
                        <td className="px-6 py-4">{getClubName(notification.senderID)}</td>
                        <td className="px-6 py-4">{notification.date ? format(new Date(notification.date._seconds * 1000), 'PPpp') : 'No Date'}</td>
                        <td className="px-6 py-4">{notification.message}</td>
                        <td className="px-6 py-4">
                          {notification.documentURL == '' || notification.documentURL == null ? 'No related document' : <a href={notification.documentURL} target='_blank'>View Document</a>}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 px-4 border-b-4 border-orange-700 hover:border-orange-500 rounded"
                            onClick={() => handleChangeStatus(notification.id, notification.status)}
                          >
                            {notification.status ? 'Read' : 'Unread'}
                          </button>
                        </td>
                      </tr>
                    ))
                )}
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
                  <th scope="col" className="px-6 py-3" onClick={() => requestSort('eventName')}>
                    Event Name {renderSortArrow('eventName')}
                  </th>
                  <th scope="col" className="px-6 py-3" onClick={() => requestSort('clubID')}>
                    Club {renderSortArrow('clubID')}
                  </th>
                  <th scope="col" className="px-6 py-3" onClick={() => requestSort('eventDate')}>
                    Event Date {renderSortArrow('eventDate')}
                  </th>
                  <th scope="col" className="px-6 py-3" onClick={() => requestSort('isApproved')}>
                    Status {renderSortArrow('isApproved')}
                  </th>
                  <th scope="col" className='px-6 py-3'>Request Document</th>
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
          <h1 className='mt-5 text-2xl font-semibold text-orange-500'>Notifications Sent</h1>
          <div className="mt-4 relative overflow-x-auto shadow-md sm:rounded-lg" style={{ width: '97%' }}>
            <table className="w-full text-sm text-left rtl:text-right">
              <thead className="text-xs text-blue-500 uppercase bg-blue-50">
                <tr>
                  <th scope="col" className="px-6 py-3" onClick={() => requestSort('receiverID')}>
                    To {renderSortArrow('receiverID')}
                  </th>
                  <th scope="col" className="px-6 py-3" onClick={() => requestSort('date')}>
                    Date {renderSortArrow('date')}
                  </th>
                  <th scope="col" className="px-6 py-3" onClick={() => requestSort('message')}>
                    Message {renderSortArrow('message')}
                  </th>
                  <th scope="col" className="px-6 py-3" onClick={() => requestSort('documentURL')}>
                    Related Document {renderSortArrow('documentURL')}
                  </th>
                  <th scope="col" className="px-6 py-3" onClick={() => requestSort('status')}>
                    Status {renderSortArrow('status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {notifications
                  .filter(notification => notification.senderID == 'HCS').length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">No data to display</td>
                  </tr>
                ) : (
                  notifications
                    .filter(notification => notification.senderID == 'HCS')
                    .map(notification => (
                      <tr key={notification.id} className='odd:bg-blue-500 odd:text-blue-50 even:bg-blue-50 even:text-blue-500'>
                        <td className="px-6 py-4">{getClubName(notification.receiverID)}</td>
                        <td className="px-6 py-4">{notification.date ? format(new Date(notification.date._seconds * 1000), 'PPpp') : 'No Date'}</td>
                        <td className="px-6 py-4">{notification.message}</td>
                        <td className="px-6 py-4">
                          {notification.documentURL == '' || notification.documentURL == null ? 'No related document' : <a href={notification.documentURL} target='_blank'>View Document</a>}
                        </td>
                        <td className="px-6 py-4">{notification.status ? 'Read' : 'Unread'}</td>
                      </tr>
                    ))
                )}

              </tbody>
            </table>
          </div>
        </div>
      </div>
      {popupMessage && (
        <div
          className={`fixed bottom-5 right-5 px-4 py-2 rounded shadow-lg ${popupMessage.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
        >
          {popupMessage.message}
        </div>
      )}
    </div>
  );
};

export default Notifications;