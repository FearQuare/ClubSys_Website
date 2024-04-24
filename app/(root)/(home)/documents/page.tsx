"use client";
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { storage } from '@/firebaseConfig';
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
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
  const [fileList, setFileList] = useState<string[]>([]);
  const fileListRef = ref(storage, "deneme/");

  const uploadFile = () => {
    if (!fileUpload) return;
    const fileRef = ref(storage, `deneme/${fileUpload.name + v4()}`);
    uploadBytes(fileRef, fileUpload).then(() => {
      alert("File Uploaded");
      // Refresh the file list after upload
      fetchFileList();
    });
  }

  const fetchFileList = () => {
    listAll(fileListRef).then((response) => {
      const urls = response.items.map(item => getDownloadURL(item));
      Promise.all(urls).then(urls => {
        setFileList(urls); // Set all URLs at once, avoiding duplicates
      });
    });
  };

  useEffect(() => {
    fetchFileList();
  }, []); // Dependency array remains empty to avoid re-fetching

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

      {fileList.map((url, index) => {
        return <a key={index} href={url} target="_blank" rel="noopener noreferrer">Download File</a>
      })}
    </div>
  )
}

export default Documents;