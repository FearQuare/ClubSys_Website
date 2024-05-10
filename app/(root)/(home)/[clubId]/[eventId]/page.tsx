'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Events } from "@/types/firestore";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import "./EventDetailsPage.css";
import { db } from '@/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { Document } from "@/types/firestore";

interface RouteParams {
    eventId?: string;
}

type Timestamp = {
    _seconds: number;
    _nanoseconds: number;
}

const customIcon = new Icon({
    iconUrl: '/marker-icon.png',
    iconRetinaUrl: '/marker-icon-2x.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const EventDetailsPage = () => {
    const { eventId } = useParams() as RouteParams;
    const [event, setEvent] = useState<Events>();
    const [documents, setDocuments] = useState<Document[]>([]);

    useEffect(() => {
        if (!eventId) return;

        fetch(`/api/events?eventId=${eventId}`)
            .then(res => res.json())
            .then((data: Events) => setEvent(data))
            .catch(error => console.error('Failed to fetch event', error));

        fetch('/api/documents')
            .then(res => res.json())
            .then((data: Document[]) => setDocuments(data))
            .catch(error => console.error('Failed to fetch documents', error));
    }, [eventId]);

    const formatDate = (timestamp: Timestamp | undefined) => {
        if (!timestamp) return 'No date provided';
        const date = new Date(timestamp._seconds * 1000);
        return date.toLocaleDateString("tr-TR");
    };

    const getEventStatus = (timestamp: Timestamp | undefined) => {
        if (!timestamp) return <span style={{ color: 'gray' }}>No date provided</span>;

        const currentDate = new Date();
        const eventDate = new Date(timestamp._seconds * 1000);
        const timeDiff = eventDate.getTime() - currentDate.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysRemaining < 0) {
            return <span className='text-gray-400'>Passed</span>;
        } else if (daysRemaining <= 15) {
            return <span className='text-red-600'>{daysRemaining - 15} days left!</span>;
        } else if (daysRemaining <= 18) {
            return <span className='text-amber-500'>{daysRemaining - 15} days left!</span>;
        } else if (daysRemaining <= 20) {
            return <span className='text-green-700'>{daysRemaining - 15} days left!</span>;
        } else {
            return <span className='text-green-700'>{daysRemaining - 15} days left!</span>;
        }
    };

    const eventApprovalStatus = (isApproved: boolean | null | undefined) => {
        if (isApproved === null || isApproved === undefined) {
            return <span className="text-amber-500">Pending</span>;
        } else if (isApproved) {
            return <span className="text-green-700">Approved</span>;
        } else {
            return <span className="text-red-600">Rejected</span>;
        }
    }

    const handleApprove = async () => {
        if (!eventId) {
            console.error("Event ID is undefined. Cannot update the document.");
            alert("Event ID is missing. Cannot proceed with approval.");
            return;
        }

        const isUploaded = documents.some(document => document.eventID === eventId);

        if (!isUploaded) {
            alert("The related event document should be uploaded to approve this event.");
            return;
        }

        const eventRef = doc(db, "Events", eventId);
        try {
            await updateDoc(eventRef, {
                isApproved: true
            });
            alert('Event successfully accepted!');
            window.location.reload();
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    }

    const handlePending = async () => {
        if (!eventId) {
            console.error("Event ID is undefined. Cannot update the document.");
            alert("Event ID is missing. Cannot proceed with approval.");
            return;
        }

        const eventRef = doc(db, "Events", eventId);
        try {
            await updateDoc(eventRef, {
                isApproved: null
            });
            alert('Event successfully added to pending!');
            window.location.reload();
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    }

    const handleReject = async () => {
        if (!eventId) {
            console.error("Event ID is undefined. Cannot update the document.");
            alert("Event ID is missing. Cannot proceed with approval.");
            return;
        }

        const eventRef = doc(db, "Events", eventId);
        try {
            await updateDoc(eventRef, {
                isApproved: false
            });
            alert('Event successfully rejected!');
            window.location.reload();
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    }

    return (
        <div className='pl-20 mt-10'>
            <h1 className='font-semibold text-3xl bg-gradient-to-t from-color3 to-color4 text-gradient'>Event Details: {event?.eventName}</h1>
            <div className="flex flex-row mt-4">
                <div className="flex flex-col">
                    <div className='rounded-3xl bg-color5 text-center pt-2 pb-6 p-36 shadow-lg'>
                        <p className='mt-5 text-color6 text-xl font-bold'>Event Date</p>
                        <p className='mt-3 text-xl font-bold'>{formatDate(event?.eventDate)} <br /> {getEventStatus(event?.eventDate)}</p>
                    </div>
                    <div className='rounded-3xl bg-color5 text-center pt-2 pb-6 p-36 shadow-lg mt-5'>
                        <p className='mt-5 text-color6 text-xl font-bold'>Event Status</p>
                        <p className='mt-3 text-xl font-bold'>{eventApprovalStatus(event?.isApproved)}</p>
                    </div>
                    <div className='rounded-3xl bg-color5 text-center pt-2 pb-6 p-36 shadow-lg mt-5'>
                        <p className='mt-5 text-color6 text-xl font-bold'>Event Type</p>
                        <p className='mt-3 text-xl font-bold'>{event?.eventType}</p>
                    </div>
                </div>
                <div className="flex flex-col ml-5" style={{ width: '40%' }}>
                    <div className="rounded-3xl bg-color5 text-center p-2 shadow-lg flex items-center justify-center" style={{ height: '28.50rem', width: '100%' }}>
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <p className='text-color6 text-xl font-bold mb-3'>Event Location</p>
                            {event && (
                                <MapContainer center={[event?.eventLocation._latitude, event?.eventLocation._longitude]} zoom={25} scrollWheelZoom={true} style={{ height: "80%", width: "95%" }} className="rounded-3xl">
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={[event?.eventLocation._latitude, event?.eventLocation._longitude]} icon={customIcon}>
                                        <Popup>
                                            {event.eventName} is located here. <br /> {event.eventType}
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col ml-5 mr-5">
                    <div className='rounded-3xl bg-color5 text-center pt-2 pb-6 p-36 shadow-lg'>
                        <p className='mt-5 text-color6 text-xl font-bold'>Change Event Status</p>
                        <ButtonGroup variant="text" aria-label="event-status-buttons" className="mt-4">
                            <Button onClick={handleApprove} className={`button-base ${event?.isApproved === true ? 'active' : ''}`} disabled={event?.isApproved === true}>Approve</Button>
                            <Button onClick={handlePending} className={`button-base ${event?.isApproved === null ? 'active' : ''}`} disabled={event?.isApproved === null}>Pending</Button>
                            <Button onClick={handleReject} className={`button-base ${event?.isApproved === false ? 'active' : ''}`} disabled={event?.isApproved === false}>Reject</Button>
                        </ButtonGroup>
                    </div>
                    <div className="rounded-3xl bg-color5 text-center pt-2 pb-6 p-2 shadow-lg mt-5 max-w-2xl scrollable-event-details" style={{ overflowY: 'auto', height: '19rem' }}>
                        <p className='mt-5 text-color6 text-xl font-bold'>Event Details</p>
                        <p className="text-left m-2">{event?.eventDescription}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EventDetailsPage;