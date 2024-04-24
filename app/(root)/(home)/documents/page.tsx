'use client';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import React, { useState } from 'react';
import { storage } from '@/firebaseConfig';
import { ref, uploadBytes } from 'firebase/storage';
import { v4 } from 'uuid';

type FileUploadState = File | null;

const Documents = () => {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  const [fileUpload, setFileUpload] = useState<FileUploadState>(null);

  if (status === 'loading') {
    return <div>Loading...</div>;
  };

  const uploadFile = () => {
    if (!fileUpload) return;
    const fileRef = ref(storage, `deneme/${fileUpload.name + v4()}`);
    uploadBytes(fileRef, fileUpload).then(() => {
      alert("File Uploaded");
    });
  }

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => {
          const files = e.target.files;
          if (files && files[0]) {
            setFileUpload(files[0]);
          }
        }}
      />
      <button onClick={uploadFile}>Upload File</button>
    </div>
  )
}

export default Documents;
