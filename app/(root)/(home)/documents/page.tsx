"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { storage, db } from '@/firebaseConfig';
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';

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

type Club = {
  id: string;
  clubName: string;
};

type Document = {
  id: string,
  dateTime?: {
    _seconds: number;
    _nanoseconds: number;
  };
  fileName: string;
  clubID: string;
  fileURL: string;
};

type FileUploadState = File | null;

const Documents = () => {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  const [fileUpload, setFileUpload] = useState<FileUploadState>(null);
  const [fileList, setFileList] = useState<string[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubID, setSelectedClubID] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
      field: 'clubID',
      headerName: 'Club Name',
      width: 150, // Adjusted width for better display
      renderCell: (params) => {
        // Find the club by ID and return the clubName
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
    const fileRef = ref(storage, `deneme/${fileUpload.name}-${uuidv4()}`);
    const snapshot = await uploadBytes(fileRef, fileUpload);
    const fileURL = await getDownloadURL(snapshot.ref);

    await addDoc(collection(db, 'Documents'), {
      clubID: selectedClubID,
      dateTime: serverTimestamp(),
      fileName: fileUpload.name,
      fileURL: fileURL
    });

    fetchFileList();
  };

  const fetchFileList = async () => {
    const fileListRef = ref(storage, "deneme/");
    const response = await listAll(fileListRef);
    const urls = await Promise.all(response.items.map(item => getDownloadURL(item)));
    setFileList(urls);
  };

  useEffect(() => {
    fetchFileList();
  }, []);

  return (
    <div>
      <div className='flex items-center space-x-1'>
        <FormControl sx={{ m: 1, minWidth: 120 }}>
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
          className="px-4 py-4"
        >
          Upload file
          <VisuallyHiddenInput
            type="file"
            onChange={handleFileChange}
            onClick={(e) => e.currentTarget.value = ''} // Reset file input
          />
        </Button>
        <Button onClick={uploadFile}>Submit Upload</Button>
      </div>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={documents}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
        />
      </div>
    </div>
  );
};

export default Documents;
