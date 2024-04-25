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
  const [selectedClubId, setSelectedClubId] = useState('');

  useEffect(() => {
    fetch('/api/clubs')
      .then(res => res.json())
      .then((data: Club[]) => setClubs(data))
      .catch(error => console.error('Failed to fetch clubs', error));
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      setFileUpload(files[0]);
    }
  };

  const uploadFile = async () => {
    if (!fileUpload || !selectedClubId) return;
    const fileRef = ref(storage, `deneme/${fileUpload.name}-${uuidv4()}`);
    const snapshot = await uploadBytes(fileRef, fileUpload);
    const fileURL = await getDownloadURL(snapshot.ref);

    await addDoc(collection(db, 'Documents'), {
      clubID: selectedClubId,
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
            value={selectedClubId}
            onChange={(e) => setSelectedClubId(e.target.value)}
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
      <div>
        
      </div>
    </div>
  );
};

export default Documents;
