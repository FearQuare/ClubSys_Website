'use client';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { ref } from 'firebase/storage';
import { storage } from '@/firebaseConfig';
import { v4 as uuidv4 } from 'uuid';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

type profilePictureUploadState = File | null;

const CreateClub = () => {
    useSession({
        required: true,
        onUnauthenticated() {
            redirect('/login');
        },
    });

    const [profilePictureUpload, setProfilePictureUpload] = useState<profilePictureUploadState>(null);

    const uploadProfilePicture = async () => {
        if (!profilePictureUpload) return;
        const pictureRef = ref(storage, `ClubProfilePictures/${profilePictureUpload.name}-${uuidv4()}`);
    }

    return (
        <div className='pl-20 mt-10'>
            <h1 className='font-semibold text-3xl bg-gradient-to-t from-color3 to-color4 text-gradient basis-2/5'>Create Club</h1>
            <button className='bg-gradient-to-t from-color3 to-color4 rounded-full mt-4'>
                <CloudUploadIcon className='text-white w-24 h-24 m-3'/>
            </button>
        </div>
    );
}

export default CreateClub;