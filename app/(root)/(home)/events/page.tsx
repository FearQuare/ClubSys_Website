'use client'
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { GridColDef, DataGrid } from '@mui/x-data-grid';
import { format } from 'date-fns';

type Event = {
  id: string;
  clubID: string;
  eventName: string;
  eventDate?: {
    _seconds: number;
    _nanoseconds: number;
  };
}

type Document = {
  id: string;
  eventID: string;
}

type Club = {
  id: string;
  clubName: string;
}

const Events = () => {
  useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  const columns: GridColDef[] = [
    {
      field: 'clubID',
      headerName: 'Club Name',
      width: 150,
      renderCell: (params) => {
        const club = clubs.find(club => club.id === params.value);
        return <span>{club ? club.clubName : 'Not found'}</span>
      }
    },
    {
      field: 'eventName',
      headerName: 'Event Name',
      width: 150,
    },
    {
      field: 'eventDate',
      headerName: 'Event Date',
      width: 180,
      renderCell: (params) => {
        const date = new Date(params.value._seconds * 1000);
        return <span>{format(date, 'PPpp')}</span>;
      },
    },
    {
      field: 'eventID',
      headerName: 'Uploaded',
      width: 120,
      renderCell: (params) => {
        const isUploaded = documents.some(document => document.eventID === params.row.id);
        return <span>{isUploaded ? 'Uploaded' : 'Not Uploaded'}</span>;
      }
    },    
  ];

  useEffect(() => {
    fetch('/api/clubs')
      .then(res => res.json())
      .then((data: Club[]) => setClubs(data))
      .catch(error => console.error('Failed to fetch clubs', error));

    fetch('/api/events')
      .then(res => res.json())
      .then((data: Event[]) => setEvents(data))
      .catch(error => console.error('Failed to fetch events', error));

    fetch('/api/documents')
      .then(res => res.json())
      .then((data: Document[]) => setDocuments(data))
      .catch(error => console.error('Failed to fetch documents', error));
  }, [])

  return (
    <div className='pl-20 mt-10'>
      <h1 className='font-semibold text-3xl bg-gradient-to-t from-color3 to-color4 text-gradient basis-2/5'>Events</h1>
      <div style={{ height: '93%', width: '93%' }}>
        <DataGrid
          rows={events}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 25},
            },
          }}
          pageSizeOptions={[25, 40]}
          getRowClassName={(params) => {
            const isUploaded = documents.some(document => document.eventID === params.row.id);
            return isUploaded ? 'bg-green-100' : 'bg-yellow-100';
          }}
          className='mt-4'         
        />
      </div>
    </div>
  )
}

export default Events