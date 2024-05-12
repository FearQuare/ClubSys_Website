'use client';
import React, { useEffect, useState } from 'react';
import { Club, Events, Document } from '@/types/firestore';
import Link from 'next/link';

type ClubEventsProps = {
    club: Club;
};

type timestamp = {
    _seconds: number;
}

const ClubEvents: React.FC<ClubEventsProps> = ({ club }) => {
    const [events, setEvents] = useState<Events[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);

    useEffect(() => {
        const fetchEvents = async () => {
            const response = await fetch(`/api/events?clubId=${club.id}`);
            const data = await response.json();
            if (response.ok && Array.isArray(data)) {
                setEvents(data);
            } else {
                console.error(data.error || 'Failed to fetch events');
                setEvents([]);  // Always reset to an empty array if there's an error or the data isn't an array
            }
        };

        const fetchDocuments = async () => {
            const response = await fetch(`/api/documents?clubId=${club.id}`);
            const data = await response.json();
            if (response.ok && Array.isArray(data)) {
                setDocuments(data);
            } else {
                console.error(data.error || 'Failed to fetch documents');
                setDocuments([]);
            }
        };

        fetchEvents();
        fetchDocuments();
    }, [club.id]);

    const formatDate = (timestamp: timestamp) => {
        const date = new Date(timestamp._seconds * 1000);
        return date.toLocaleDateString("tr-TR");
    };

    const checkDocumentStatus = (eventId: string) => {
        const documentExists = documents.some(doc => doc.eventID === eventId);
        return documentExists ? "Document uploaded" : "Not uploaded";
    };

    return (
        <div style={{ width: '97%' }}>
            <h1 className='font-semibold text-3xl bg-gradient-to-t from-color3 to-color4 text-gradient'>Club Events</h1>
            <div className='flex flex-row mt-4'>
                <div className='flex flex-col w-4/12'>
                    <h2 className='font-semibold text-xl bg-gradient-to-t from-color3 to-color4 text-gradient'>Approved</h2>
                    {events.map(event => (
                        event.isApproved && (
                            <Link href={`/${club.id}/${event.id}`} key={event.id} legacyBehavior>
                                <div className='flex items-center justify-center mt-2 bg-green-200 rounded-xl text-center shadow-lg hover:border-2 border-blue-400' style={{ width: '97%', height: '3rem' }}>
                                    {event.eventName} | {formatDate(event.eventDate)} | {checkDocumentStatus(event.id)}
                                </div>
                            </Link>
                        )
                    ))}
                </div>
                <div className='flex flex-col w-4/12'>
                    <h2 className='font-semibold text-xl bg-gradient-to-t from-color3 to-color4 text-gradient'>Pending</h2>
                    {events.map(event => (
                        event.isApproved == null && (
                            <Link href={`/${club.id}/${event.id}`} key={event.id} legacyBehavior>
                                <div className='flex items-center justify-center mt-2 bg-amber-200 rounded-xl text-center shadow-lg hover:border-2 border-blue-400' style={{ width: '97%', height: '3rem' }}>
                                    {event.eventName} | {formatDate(event.eventDate)} | {checkDocumentStatus(event.id)}
                                </div>
                            </Link>
                        )
                    ))}

                </div>
                <div className='flex flex-col w-4/12'>
                    <h2 className='font-semibold text-xl bg-gradient-to-t from-color3 to-color4 text-gradient'>Rejected</h2>
                    {events.map(event => (
                        !event.isApproved && event.isApproved != null && (
                            <Link href={`/${club.id}/${event.id}`} key={event.id} legacyBehavior>
                                <div className='flex items-center justify-center mt-2 bg-red-200 rounded-xl text-center shadow-lg hover:border-2 border-blue-400' style={{ width: '97%', height: '3rem' }}>
                                    {event.eventName} | {formatDate(event.eventDate)} | {checkDocumentStatus(event.id)}
                                </div>
                            </Link>
                        )
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ClubEvents;