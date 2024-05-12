'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearch } from '@/contexts/SearchContext';
import { Club } from '@/types/firestore';

const ClubBoxes: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const { searchQuery } = useSearch();

  useEffect(() => {
    async function fetchClubs() {
      try {
        const response = await fetch('/api/clubs');
        if (!response.ok) throw new Error('Failed to fetch clubs');
        const clubs: Club[] = await response.json();
        setClubs(clubs);
      } catch (error) {
        console.error('Error fetching clubs:', error);
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
          <a className="block bg-color3 rounded-lg overflow-hidden shadow-lg hover:border-2 border-blue-600 transition-colors cursor-pointer w-60 h-64 mb-5">
            <div className="p-4 flex flex-col items-center">
              <div className="bg-white rounded-full w-32 h-32 mb-4 mt-5 flex items-center justify-center">
                <img src={club.clubIcon} alt={`${club.clubName} logo`} className="w-full h-full rounded-full object-cover" onError={(e) => (e.currentTarget.src = 'fallback-image-url')} />
              </div>
              <h3 className="text-white text-lg text-center font-semibold">{club.clubName}</h3>
            </div>
          </a>
        </Link>
      ))}
    </div>
  );
};

export default ClubBoxes;
