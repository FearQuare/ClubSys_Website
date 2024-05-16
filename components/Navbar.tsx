'use client'
import React, { useEffect, useState, useRef } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useSearch } from '@/contexts/SearchContext';

const Navbar = () => {
  const [staffName, setStaffName] = useState('');
  const [staffLastName, setStaffLastName] = useState('');
  const { searchQuery, setSearchQuery } = useSearch();
  const navbarRef = useRef<HTMLDivElement>(null);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

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

  useEffect(() => {
    const updateNavbarHeight = () => {
      if (navbarRef.current) {
        document.documentElement.style.setProperty('--navbar-height', `${navbarRef.current!.offsetHeight}px`);
      }
    };

    updateNavbarHeight();
    window.addEventListener('resize', updateNavbarHeight);

    return () => {
      window.removeEventListener('resize', updateNavbarHeight);
    };
  }, []);

  return (
    <nav ref={navbarRef} className='flex-between fixed w-full px-6 py-4 lg:px-10 bg-white z-50'>
      <div className="flex flex-row items-center w-full">
        <div className={`relative ${isSearchVisible ? 'basis-full' : 'basis-2/5'} sm:hidden`}>
          {isSearchVisible && (
            <>
              <input
                type="text"
                placeholder="Search club or team name"
                className="pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:border-blue-500 shadow-md w-full text-center"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-0 top-0 mt-2 ml-3 cursor-pointer" onClick={() => setIsSearchVisible(false)}>
                <CloseIcon />
              </div>
            </>
          )}
          {!isSearchVisible && (
            <div className="cursor-pointer" onClick={() => setIsSearchVisible(true)}>
              <SearchIcon />
            </div>
          )}
        </div>
        <div className='hidden sm:flex relative basis-2/5'>
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
        <div className={`font-semibold text-3xl bg-gradient-to-t from-color3 to-color4 text-gradient ${isSearchVisible ? 'hidden' : 'block'} sm:block sm:pl-4`}>Hello {staffName} {staffLastName}!</div>
      </div>
    </nav>
  )
}

export default Navbar;