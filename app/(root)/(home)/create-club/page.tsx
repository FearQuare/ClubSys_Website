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
import { collection, addDoc, query, where, getDocs, arrayUnion } from 'firebase/firestore';
import Alert, { AlertColor } from '@mui/material/Alert';
import { Student, Advisor, Interest } from '@/types/firestore';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

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

const CreateClub = () => {
    const editorRef = useRef<AvatarEditor | null>(null);
    const [scale, setScale] = useState<number>(1);
    const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
    const [rotate, setRotate] = useState<number>(0);
    const [borderRadius, setBorderRadius] = useState<number>(50);
    const [image, setImage] = useState<string>('/add-image.png');
    const [clubName, setClubName] = useState<string>('');
    const [selectedAdvisorID, setSelectedAdvisorID] = useState<string>('');
    const [selectedInterestID, setSelectedInterestID] = useState<string>('');
    const [advisors, setAdvisors] = useState<Advisor[]>([]);
    const [clubDescription, setClubDescription] = useState<string>('');
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudentID, setSelectedStudentID] = useState<string>('');
    const [alert, setAlert] = useState<{ show: boolean; severity: AlertColor | undefined; message: string }>({
        show: false,
        severity: undefined,
        message: ''
    });
    const [isClubNameValid, setIsClubNameValid] = useState(true);
    const [isAdvisorValid, setIsAdvisorValid] = useState(true);
    const [isInterestValid, setIsInterestValid] = useState(true);
    const [isPresidentValid, setIsPresidentValid] = useState(true);
    const [interests, setInterests] = useState<Interest[]>([]);

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

        fetch('/api/interests')
            .then(res => res.json())
            .then((data: Interest[]) => setInterests(data))
            .catch(error => console.error('Failed to fetch interests', error));
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
        let isValid = true;

        if (!clubName.trim()) {
            setIsClubNameValid(false);
            setAlert({ show: true, severity: 'error', message: 'You cannot leave Club Name field empty!' });
            isValid = false;
        }

        if (!selectedAdvisorID) {
            setIsAdvisorValid(false);
            setAlert({ show: true, severity: 'error', message: 'Selecting an Advisor is required.' });
            isValid = false;
        }

        if (!selectedInterestID) {
            setIsInterestValid(false);
            setAlert({ show: true, severity: 'error', message: 'Selecting an Interest is required.' });
            isValid = false;
        }

        if (!selectedStudentID) {
            setIsPresidentValid(false);
            setAlert({ show: true, severity: 'error', message: 'Selecting a President is required.' });
            isValid = false;
        }

        if (!isValid) return;

        const studentRef = doc(db, "Students", selectedStudentID);
        const studentDoc = await getDoc(studentRef);
        if (studentDoc.exists() && studentDoc.data().boardMemberOf) {
            setAlert({ show: true, severity: 'error', message: 'You cannot add this student as a president because this student is already related by other clubs as a board member.' });
            return;
        }

        const querySnapshot = await getDocs(query(collection(db, 'Clubs'), where('clubName', '==', clubName.trim())));
        if (!querySnapshot.empty) {
            setAlert({ show: true, severity: 'error', message: 'This club name already exists try another name.' });
            setIsClubNameValid(false);
            return;
        }

        let imageUrl = null;
        if (image !== '/add-image.png' && editorRef.current) {
            const canvas = editorRef.current.getImageScaledToCanvas();
            const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
            if (blob) {
                try {
                    const imageRef = ref(storage, `ClubIcons/${new Date().toISOString()}.png`);
                    const snapshot = await uploadBytes(imageRef, blob);
                    imageUrl = await getDownloadURL(snapshot.ref);
                } catch (error) {
                    console.error('Failed to upload image to Firebase Storage', error);
                    setAlert({ show: true, severity: 'error', message: 'Failed to upload image to Firebase Storage.' });
                    return;
                }
            } else {
                console.error('Canvas blob is null');
                setAlert({ show: true, severity: 'error', message: 'Failed to get the image blob.' });
                return;
            }
        }

        const clubDoc = {
            advisorID: selectedAdvisorID,
            boardMembers: [
                {
                    memberRole: "President",
                    permissions: { canEdit: true, canEventPost: true, canAddMembers: true },
                    studentID: selectedStudentID
                }
            ],
            clubDescription,
            clubIcon: imageUrl,
            clubName,
            memberList: [selectedStudentID]
        };

        try {
            const docRef = await addDoc(collection(db, "Clubs"), clubDoc);
            setAlert({ show: true, severity: 'success', message: `Club created with ID: ${docRef.id}` });

            await updateDoc(studentRef, {
                boardMemberOf: docRef.id,
                followedClubList: arrayUnion(docRef.id),
                joinedClubList: arrayUnion(docRef.id)
            });

            const interestRef = doc(db, "Interests", selectedInterestID);
            await updateDoc(interestRef, {
                relatedClubs: arrayUnion(docRef.id)
            });


            setClubName('');
            setSelectedAdvisorID('');
            setSelectedInterestID('');
            setClubDescription('');
            setSelectedStudentID('');
            setImage('/add-image.png');
            setScale(1);
            setPosition({ x: 0.5, y: 0.5 });
            setRotate(0);
            setBorderRadius(50);
            setIsClubNameValid(true);
            setIsAdvisorValid(true);
            setIsInterestValid(true);
            setIsPresidentValid(true);
        } catch (error) {
            console.error('Error creating club document in Firestore', error);
            setAlert({ show: true, severity: 'error', message: 'Error creating club document.' });
        }
    };

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
                                value={clubName}
                                error={!isClubNameValid}
                                helperText={!isClubNameValid ? (clubName.trim() ? 'This club name already exists try another name.' : 'You cannot leave Club Name field empty!') : ''}
                                onChange={(event) => {
                                    setClubName(event.target.value);
                                    if (!isClubNameValid) {
                                        setIsClubNameValid(true);
                                    }
                                }}
                            />
                        </div>
                        <div className='flex flex-col ml-3'>
                            <FormControl variant="outlined" className='min-w-60' error={!isAdvisorValid}>
                                <InputLabel id="advisor-label">Advisor</InputLabel>
                                <Select
                                    labelId="advisor-label"
                                    value={selectedAdvisorID}
                                    onChange={(e) => {
                                        setSelectedAdvisorID(e.target.value);
                                        if (!isAdvisorValid) {
                                            setIsAdvisorValid(true);
                                        }
                                    }}
                                    label="Advisor"
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
                        <div className='flex flex-col ml-3'>
                            <FormControl variant="outlined" className='min-w-60' error={!isInterestValid}>
                                <InputLabel id="interest-label">Interest</InputLabel>
                                <Select
                                    labelId="interest-label"
                                    value={selectedInterestID}
                                    onChange={(e) => {
                                        setSelectedInterestID(e.target.value);
                                        if (!isInterestValid) {
                                            setIsInterestValid(true);
                                        }
                                    }}
                                    label="Interest"
                                    input={<OutlinedInput label="Interest" />}
                                >
                                    {interests.map((interest) => (
                                        <MenuItem
                                            key={interest.id}
                                            value={interest.id}
                                        >
                                            {`${interest.interestName}`}
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
                            value={clubDescription}
                            onChange={(e) => setClubDescription(e.target.value)}
                            className='min-w-full'
                        />
                    </div>
                    <div className='flex flex-row mt-5'>
                        <Autocomplete
                            value={students.find(student => student.id === selectedStudentID) || null}
                            onChange={(_, newValue: Student | null) => {
                                setSelectedStudentID(newValue ? newValue.id : '');
                                if (!newValue) {
                                    setIsPresidentValid(false);
                                } else {
                                    if (!isPresidentValid) {
                                        setIsPresidentValid(true);
                                    }
                                }
                            }}
                            options={students}
                            getOptionLabel={(option: Student) => `${option.firstName} ${option.lastName}`}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="President"
                                    variant="outlined"
                                    required
                                    error={!isPresidentValid}
                                    helperText={!isPresidentValid ? 'Selecting a President is required.' : ''}
                                />
                            )}
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
            {alert.show && (
                <Stack sx={{ width: '100%' }} spacing={2}>
                    <Alert severity={alert.severity}>{alert.message}</Alert>
                </Stack>
            )}
        </div>
    );
}

export default CreateClub;