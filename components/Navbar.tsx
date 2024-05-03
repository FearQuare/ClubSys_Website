'use client'
import React, { useEffect, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import ButtonGroup from '@mui/material/ButtonGroup';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { signOut } from "next-auth/react"
import { useSearch } from '@/contexts/SearchContext';

const Navbar = () => {
  const [staffName, setStaffName] = useState('');
  const [staffLastName, setStaffLastName] = useState('');
  const { searchQuery, setSearchQuery } = useSearch();

  const buttons = [
    <IconButton key="profile" className='text-black text-3xl'><PersonOutlineIcon /></IconButton>,
    <IconButton key="notification" className='text-black text-3xl'><NotificationsNoneIcon /></IconButton>,
    <IconButton key="signout" className='text-black text-3xl'><ExitToAppIcon onClick={() => signOut()} /></IconButton>,
  ];

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
    <nav className='flex-between fixed z-50 w-full px-6 py-4 lg:px-10 bg-white'>
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
        <div className='flex'>
          <ButtonGroup size="large" aria-label="Large button group" className='justify-self-end self-end basis-1/5'>
            {buttons}
          </ButtonGroup>
        </div>
      </div>
    </nav>
  )
}

export default Navbar