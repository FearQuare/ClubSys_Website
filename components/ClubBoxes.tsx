'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearch } from '@/contexts/SearchContext';

type Club = {
  id: string;
  advisorID: string;
  boardMembers: {
    memberRole: string;
    permissions: Record<string, boolean>;
    studentID: string;
  }[];
  clubDescription: string;
  clubIcon: string;
  clubName: string;
  feedbacks: { feedback: string; studentID: string }[];
  memberNum: number;
  memberList: string[];
};

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

    fetchClubs().then(() => {
      console.log(clubs);
    });
  }, []);

  const filteredClubs =  clubs.filter(club =>
    club.clubName.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
      <Link 
        href="/create-club"
        className="block bg-color3 rounded-lg overflow-hidden shadow-lg hover:border-2 border-blue-600 transition-colors cursor-pointer w-72 h-64 flex items-center justify-center text-white text-center"
      >
        <div>
          <div className="text-5xl">+</div>
          <div>Create Club</div>
        </div>
      </Link>
      {filteredClubs.map((club) => (
        <Link
          href={`/clubs/${club.id}`}
          key={club.id}
          className="block bg-color3 rounded-lg overflow-hidden shadow-lg hover:border-2 border-blue-600 transition-colors cursor-pointer w-72 h-64"
        >
          <div className="p-4 flex flex-col items-center">
            <div className="bg-white rounded-full w-32 h-32 mb-4 flex items-center justify-center">
              <img src={club.clubIcon} alt={`${club.clubName} logo`} className="w-full h-full rounded-full object-cover" onError={(e) => (e.currentTarget.src = 'fallback-image-url')} />
            </div>
            <h3 className="text-white text-lg text-center">{club.clubName}</h3>
            {/* Add other club details you want to display */}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ClubBoxes;
