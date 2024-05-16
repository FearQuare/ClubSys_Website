'use client'
import React, { useEffect, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search';
import { useSearch } from '@/contexts/SearchContext';

const Navbar = () => {
  const [staffName, setStaffName] = useState('');
  const [staffLastName, setStaffLastName] = useState('');
  const { searchQuery, setSearchQuery } = useSearch();

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await fetch('/api/staff');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setStaffName(data.staffName);
        setStaffLastName(data.staffLastName);
        
        if (!data.staffName || !data.staffLastName) {
          console.error('Missing staff name or last name, refreshing page.');
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to fetch staff data:', error);
      }
    };
    fetchStaffData();
  }, []);

  return (
    <nav className='flex-between fixed w-full px-6 py-4 lg:px-10 bg-white z-50'>
      <div className="flex flex-row items-center pag-4 w-full">
        <div className='relative basis-2/5'>
          <input
            type="text"
            placeholder="Search club or team name"
            className="pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:border-blue-500 shadow-md w-full text-center"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-0 top-0 mt-2 ml-3">
            <SearchIcon />
          </div>
        </div>
        <div className='font-semibold text-3xl bg-gradient-to-t from-color3 to-color4 text-gradient basis-2/5 pl-32'>Hello {staffName} {staffLastName}!</div>
      </div>
    </nav>
  )
}

export default Navbar