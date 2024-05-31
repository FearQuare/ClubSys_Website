"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { storage, db } from '@/firebaseConfig';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import { Club, Document } from '@/types/firestore';
import TextField from '@mui/material/TextField';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

type FileUploadState = File | null;

const Documents = () => {
  useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  const [fileUpload, setFileUpload] = useState<FileUploadState>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubID, setSelectedClubID] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [message, setMessage] = useState('');

  const columns: GridColDef[] = [
    {
      field: 'clubID',
      headerName: 'Club Name',
      width: 150,
      renderCell: (params) => {
        const club = clubs.find(club => club.id === params.value);
        return <span>{club ? club.clubName : 'Not found'}</span>;
      }
    },
    {
      field: 'dateTime',
      headerName: 'Date & Time',
      width: 180,
      renderCell: (params) => {
        const date = new Date(params.value._seconds * 1000);
        return <span>{format(date, 'PPpp')}</span>;
      }
    },
    { field: 'fileName', headerName: 'File Name', width: 150 },
    {
      field: 'fileURL',
      headerName: 'File URL',
      width: 250,
      renderCell: (params) => <a href={params.value} target="_blank" rel="noopener noreferrer">Open File</a>
    },
    {
      field: 'actions',
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          key={params.id}
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(String(params.id), String(params.row.filePath))}
        />
      ],
    },
  ];

  useEffect(() => {
    fetch('/api/clubs')
      .then(res => res.json())
      .then((data: Club[]) => setClubs(data))
      .catch(error => console.error('Failed to fetch clubs', error));

    fetch('/api/documents')
      .then(res => res.json())
      .then((data: Document[]) => setDocuments(data))
      .catch(error => console.error('Failed to fetch documents', error));
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      setFileUpload(files[0]);
    }
  };

  const uploadFile = async () => {
    if (!fileUpload || !selectedClubID) return;
    const fileRef = ref(storage, `Documents/${selectedClubID}/${fileUpload.name}-${uuidv4()}`);
    const snapshot = await uploadBytes(fileRef, fileUpload);
    const fileURL = await getDownloadURL(snapshot.ref);
    const filePath = fileRef.fullPath;

    await addDoc(collection(db, 'Documents'), {
      clubID: selectedClubID,
      dateTime: serverTimestamp(),
      fileName: fileUpload.name,
      fileURL: fileURL,
      filePath: filePath
    });

    await addDoc(collection(db, 'Notifications'), {
      senderID: 'HCS',
      receiverID: selectedClubID,
      message: message,
      document: fileURL
    });

    window.location.reload();
  };


  const handleDelete = async (id: string, filePath: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath }),
      });

      if (response.ok) {
        setDocuments(documents.filter((doc) => doc.id !== id));
        alert('Document successfully deleted.');
      } else {
        const errorData = await response.json();
        console.error('Error deleting document:', errorData.message);
        alert('Failed to delete document.');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document.');
    }
  };

  return (
    <div>
      <h1 className='font-semibold text-3xl bg-gradient-to-t from-color3 to-color4 text-gradient basis-2/5'>Documents</h1>
      <div className='flex items-center space-x-1'>
        <FormControl sx={{ m: 0, minWidth: 200 }} className='mt-4'>
          <InputLabel id="clubs-label">Select Club</InputLabel>
          <Select
            labelId='clubs-label'
            id='clubs'
            value={selectedClubID}
            onChange={(e) => setSelectedClubID(e.target.value)}
            input={<OutlinedInput label='club-name' />}
            MenuProps={MenuProps}
          >
            {clubs.map((club) => (
              <MenuItem
                key={club.id}
                value={club.id}
              >
                {club.clubName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          component="label"
          role={undefined}
          variant='contained'
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
          className="px-4 py-4 mt-4"
        >
          Upload file
          <VisuallyHiddenInput
            type="file"
            onChange={handleFileChange}
            onClick={(e) => e.currentTarget.value = ''}
          />
        </Button>
        <div className='mt-4'>
          <TextField id="message" label="Message" variant="outlined" onChange={(event) => setMessage(event.target.value)} />
        </div>
        <Button onClick={uploadFile} className='mt-4'>Submit Upload</Button>
      </div>
      <div style={{ height: '93%', width: '93%' }}>
        <DataGrid
          rows={documents}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 25 },
            },
          }}
          pageSizeOptions={[25, 40]}
          className='mt-4'
        />
      </div>
    </div>
  );
};

export default Documents;
