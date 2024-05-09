'use client';

import { useParams } from "next/navigation";
import { useEffect } from "react";

interface RouteParams {
    eventId?: string;
}

const EventDetailsPage = () => {
    const { eventId } = useParams() as RouteParams;

    useEffect(() => {
        if(!eventId) return;

    }, [eventId]);

    return(
        <p>{eventId}</p>
    );
}

export default EventDetailsPage;