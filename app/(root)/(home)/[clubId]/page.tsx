'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Club {
    id: string;
    clubName: string;
    clubDescription: string;
    clubIcon: string;
}

// Define a type for expected route parameters
interface RouteParams {
    clubId?: string;
}

const ClubDetailsPage = () => {
    // Use type assertion here
    const { clubId } = useParams() as RouteParams;

    const [club, setClub] = useState<Club | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (!clubId) return; // Make sure clubId is present

        const fetchClub = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/clubs?clubId=${clubId}`);
                if (!response.ok) throw new Error(`Club data fetch failed: Status ${response.status}`);
                const data: Club = await response.json();
                setClub(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unexpected error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchClub();
    }, [clubId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!club) return <div>No club data available.</div>;

    return (
        <div>
            <h1>{club.clubName}</h1>
            <p>{club.clubDescription}</p>
            {/* Render other club details */}
        </div>
    );
};

export default ClubDetailsPage;
