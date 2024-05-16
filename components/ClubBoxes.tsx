'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearch } from '@/contexts/SearchContext';
import { Club } from '@/types/firestore';

const ClubBoxes: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
  const { searchQuery } = useSearch();

  useEffect(() => {
    async function fetchClubs() {
      try {
        const response = await fetch('/api/clubs');
        if (!response.ok) throw new Error('Failed to fetch clubs');
        const clubs: Club[] = await response.json();
        setClubs(clubs);
        fetchEventCounts(clubs);
      } catch (error) {
        console.error('Error fetching clubs:', error);
      }
    }

    async function fetchEventCounts(clubs: Club[]) {
      try {
        const counts: Record<string, number> = {};
        for (const club of clubs) {
          const response = await fetch(`/api/events?clubId=${club.id}`);
          if (response.ok) {
            const events = await response.json();
            if (Array.isArray(events)) {
              console.log('Events for club', club.id, events); // Log the events
              const count = events.filter(event => event.isApproved === null || event.isApproved === undefined).length;
              counts[club.id] = count;
            } else {
              counts[club.id] = 0;
            }
          } else {
            counts[club.id] = 0;
          }
        }
        console.log('Event counts:', counts); // Log the counts
        setEventCounts(counts);
      } catch (error) {
        console.error('Error fetching event counts:', error);
      }
    }

    fetchClubs();
  }, []);

  const filteredClubs = clubs.filter(club =>
    club.clubName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-1 p-1">
      <Link
        href="/create-club"
        className="bg-color3 rounded-lg overflow-hidden shadow-lg hover:border-2 border-blue-600 transition-colors cursor-pointer w-60 h-64 flex items-center justify-center text-white text-center"
      >
        <div>
          <div className="text-5xl">+</div>
          <div>Create Club</div>
        </div>
      </Link>
      {filteredClubs.map((club) => (
        <Link href={`/${club.id}`} key={club.id} legacyBehavior>
          <a className="relative block bg-color3 rounded-lg overflow-hidden shadow-lg hover:border-2 border-blue-600 transition-colors cursor-pointer w-60 h-64 mb-5">
            <div className="p-4 flex flex-col items-center">
              <div className="bg-white rounded-full w-32 h-32 mb-4 mt-5 flex items-center justify-center">
                <img src={club.clubIcon} alt={`${club.clubName} logo`} className="w-full h-full rounded-full object-cover" onError={(e) => (e.currentTarget.src = 'fallback-image-url')} />
              </div>
              <h3 className="text-white text-lg text-center font-semibold">{club.clubName}</h3>
            </div>
            {eventCounts[club.id] > 0 && (
              <div className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                {eventCounts[club.id]}
              </div>
            )}
          </a>
        </Link>
      ))}
    </div>
  );
};

export default ClubBoxes;