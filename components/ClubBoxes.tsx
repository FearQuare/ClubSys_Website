'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type Club = {
  id: string;
  advisorID: string;
  boardMembers: {
    memberRole: string;
    permissions: Record<string, boolean>;
    studentID: string;
  }[];
  clubDescription: string;
  clubName: string;
  feedbacks: { feedback: string; studentID: string }[];
  memberNum: number;
  memberList: string[];
};

const ClubBoxes: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);

  useEffect(() => {
    async function fetchClubs() {
      const response = await fetch('/api/clubs');
      const data: Club[] = await response.json();
      setClubs(data);
    }

    fetchClubs();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
      {clubs.map((club) => (
        <Link 
          href={`/clubs/${club.id}`} 
          key={club.id} 
          className="block bg-color3 rounded-lg overflow-hidden shadow-lg hover:border-2 border-blue-600 transition-colors cursor-pointer w-72 h-64"
        >
          <div className="p-4 flex flex-col items-center">
            <div className="bg-white rounded-full w-32 h-32 mb-4 flex items-center justify-center">
              {/* Placeholder for club icon */}
              {/* Add img tag here if you have icons for clubs */}
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
