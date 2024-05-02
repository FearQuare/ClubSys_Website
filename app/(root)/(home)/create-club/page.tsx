'use client';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import AvatarEditor from 'react-avatar-editor';
import { useState, useRef, useEffect } from 'react';
import Button from '@mui/material/Button';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Stack from '@mui/material/Stack';
import UploadIcon from '@mui/icons-material/Upload';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import { storage, db } from '@/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

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

type Permissions = {
    canEdit: boolean;
    canEventPost: boolean;
    canAddMembers: boolean;
}

type BoardMember = {
    memberRole: string;
    permissions: Permissions;
    studentID: string;
}

type Club = {
    id: string;
    advisorID: string;
    boardMembers: BoardMember[];
    clubDescription: string;
    clubIcon: string;
    clubName: string;
    memberList: string[];
};

type Student = {
    id: string;
    firstName: string;
    lastName: string;
}

type Advisor = {
    id: string;
    advisorLastName: string;
    advisorName: string;
}

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

const CreateClub = () => {
    const editorRef = useRef<AvatarEditor | null>(null);
    const [scale, setScale] = useState<number>(1);
    const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
    const [rotate, setRotate] = useState<number>(0);
    const [borderRadius, setBorderRadius] = useState<number>(50);
    const [image, setImage] = useState<string>('/add-image.png');
    const [clubName, setClubName] = useState<string>('');
    const [selectedAdvisorID, setSelectedAdvisorID] = useState<string>('');
    const [advisors, setAdvisors] = useState<Advisor[]>([]);
    const [clubDescription, setClubDescription] = useState<string>('');
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudentID, setSelectedStudentID] = useState<string>('');

    useSession({
        required: true,
        onUnauthenticated() {
            redirect('/login');
        },
    });

    useEffect(() => {
        fetch('/api/advisors')
            .then(res => res.json())
            .then((data: Advisor[]) => setAdvisors(data))
            .catch(error => console.error('Failed to fetch advisors', error));

        fetch('/api/students')
            .then(res => res.json())
            .then((data: Student[]) => setStudents(data))
            .catch(error => console.error('Failed to fetch students', error));
    }, []);

    const handlePositionChange = (position: { x: number; y: number }) => {
        setPosition(position);
    };

    const handleNewImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImage(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleScale = (value: number | number[]) => {
        if (typeof value === 'number') {
            setScale(value);
        } else {
            console.error('Expected a number, but received an array.');
        }
    };

    const handleSubmit = async () => {
        if (editorRef.current && image) {
            const canvas = editorRef.current.getImageScaledToCanvas();
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    console.error('Canvas blob is null');
                    return;
                }
                try {
                    const imageRef = ref(storage, `ClubIcons/${new Date().toISOString()}.png`);
                    const snapshot = await uploadBytes(imageRef, blob);
                    const imageUrl = await getDownloadURL(snapshot.ref);
                    console.log('Image uploaded to Firebase Storage!');

                    const clubDoc = {
                        advisorID: selectedAdvisorID,
                        boardMembers: [
                            {
                                memberRole: "President",
                                permissions: { canEdit: true, canEventPost: true, canAddMembers: true },
                                studentID: selectedStudentID
                            }
                        ],
                        clubDescription: clubDescription,
                        clubIcon: imageUrl,
                        clubName,
                        memberList: [selectedStudentID]
                    };

                    const docRef = await addDoc(collection(db, "Clubs"), clubDoc);
                    console.log("Club created with ID: ", docRef.id);
                } catch (error) {
                    console.error('Failed to upload image to Firebase Storage', error);
                }
            }, 'image/png');
        }
    };

    const handleClubName = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newName = event.target.value;
        setClubName(newName);
        console.log(newName);
    }

    return (
        <div className='pl-20 mt-10'>
            <h1 className='font-semibold text-3xl bg-gradient-to-t from-color3 to-color4 text-gradient basis-2/5'>Create Club</h1>
            <div className='flex flex-row'>
                <div className='mt-5 flex flex-col'>
                    <div className='bg-gray-200 max-w-64 mb-0'>
                        <AvatarEditor
                            ref={editorRef}
                            scale={scale}
                            width={206}
                            height={200}
                            position={position}
                            onPositionChange={handlePositionChange}
                            rotate={rotate}
                            borderRadius={(330 * borderRadius) / 100}
                            image={image}
                            color={[255, 255, 255]}
                            className='editor-canvas'
                        />
                    </div>
                    <div>
                        <Button
                            component='label'
                            role={undefined}
                            variant='contained'
                            tabIndex={-1}
                            startIcon={<AddAPhotoIcon />}
                            className='px-4 py-4 ml-12'
                        >
                            Upload File
                            <VisuallyHiddenInput
                                type='file'
                                onChange={handleNewImage}
                                onClick={(e) => e.currentTarget.value = ''}
                            />
                        </Button>
                    </div>
                    <div className='ml-6 mt-3'>
                        <Box sx={{ width: 200 }}>
                            <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
                                <RemoveIcon />
                                <Slider
                                    defaultValue={1}
                                    aria-label="Zoom"
                                    valueLabelDisplay="auto"
                                    step={0.01}
                                    marks
                                    min={1}
                                    max={2}
                                    onChange={(e, value) => handleScale(value)}
                                    sx={{ width: 200 }}
                                />
                                <AddIcon />
                            </Stack>
                        </Box>
                    </div>
                </div>
                <Box component="form" autoComplete='off' className='m-auto w-3/5 mt-1.5'>
                    <div className='flex flex-row'>
                        <div className='flex flex-col'>
                            <TextField
                                required
                                id="outlined-required"
                                label="Club Name"
                                onChange={handleClubName}
                            />
                        </div>
                        <div className='flex flex-col ml-3'>
                            <FormControl variant="outlined" className='min-w-60'>
                                <InputLabel id="advisor-label">Advisor</InputLabel>
                                <Select
                                    labelId="advisor-label"
                                    value={selectedAdvisorID}
                                    onChange={(e) => setSelectedAdvisorID(e.target.value)}
                                    label="Advisor" // Set the same label as the InputLabel
                                    input={<OutlinedInput label="Advisor" />}
                                >
                                    {advisors.map((advisor) => (
                                        <MenuItem
                                            key={advisor.id}
                                            value={advisor.id}
                                        >
                                            {`${advisor.advisorName} ${advisor.advisorLastName}`}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                    </div>
                    <div className='flex flex-row mt-5'>
                        <TextField
                            id="outlined-required"
                            label="Club Description"
                            multiline
                            rows={5}
                            onChange={(e) => setClubDescription(e.target.value)}
                            className='min-w-full'
                        />
                    </div>
                    <div className='flex flex-row mt-5'>
                        <Autocomplete
                            value={students.find(student => student.id === selectedStudentID)}
                            onChange={(_, newValue: Student | null) => setSelectedStudentID(newValue ? newValue.id : '')}
                            options={students}
                            getOptionLabel={(option: Student) => `${option.firstName} ${option.lastName}`}
                            renderInput={(params) => <TextField {...params} label="President" variant="outlined" required />}
                            fullWidth
                        />
                    </div>
                    <div className='flex flex-row'>
                        <Button
                            variant='contained'
                            startIcon={<UploadIcon />}
                            onClick={handleSubmit}
                            className='bg-blue-500 text-white max-h-10 mt-5'
                        >
                            Submit
                        </Button>
                    </div>
                </Box>
            </div>
        </div>
    );
}

export default CreateClub;