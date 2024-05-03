'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import BoardMemberList from '@/components/BoardMemberList';
import Statiscics from '@/components/Statistics';
import ClubEvents from '@/components/ClubEvents';
import EditClub from '@/components/EditClub';

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

interface Club {
    id: string;
    clubName: string;
    clubDescription: string;
    clubIcon: string;
    boardMembers: BoardMember[];
}

type Student = {
    id: string;
    firstName: string;
    lastName: string;
}

interface RouteParams {
    clubId?: string;
}

const ClubDetailsPage = () => {
    const { clubId } = useParams() as RouteParams;
    const [club, setClub] = useState<Club | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [president, setPresident] = useState<Student | null>(null);
    const [visibleBoardMembers, setVisibleBoardMembers] = useState(true);
    const [visibleClubEvents, setVisibleClubEvents] = useState(false);
    const [visibleEditClub, setVisibleEditClub] = useState(false);
    const [visibleStatistics, setVisibleStatistics] = useState(false);

    useEffect(() => {
        if (!clubId) return;

        const fetchClub = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/clubs?clubId=${clubId}`);
                if (!response.ok) throw new Error(`Club data fetch failed: Status ${response.status}`);
                const data: Club = await response.json();
                setClub(data);

                const presidentMember = data.boardMembers.find(member => member.memberRole === "President");
                if (presidentMember) {
                    const studentResponse = await fetch(`/api/students?studentId=${presidentMember.studentID}`);
                    if (studentResponse.ok) {
                        const studentData: Student = await studentResponse.json();
                        setPresident(studentData);
                    } else {
                        throw new Error(`Failed to fetch president's data: Status ${studentResponse.status}`);
                    }
                } else {
                    throw new Error("President not found in the board members");
                }
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unexpected error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchClub();
    }, [clubId]);

    const handleBoardMembersClick = () => {
        setVisibleBoardMembers(true);
        setVisibleClubEvents(false);
        setVisibleEditClub(false);
        setVisibleStatistics(false);
    };

    const handleClubEventsClick = () => {
        setVisibleBoardMembers(false);
        setVisibleClubEvents(true);
        setVisibleEditClub(false);
        setVisibleStatistics(false);
    };

    const handleEditClubClick = () => {
        setVisibleBoardMembers(false);
        setVisibleClubEvents(false);
        setVisibleEditClub(true);
        setVisibleStatistics(false);
    };

    const handleStatisticsClick = () => {
        setVisibleBoardMembers(false);
        setVisibleClubEvents(false);
        setVisibleEditClub(false);
        setVisibleStatistics(true);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!club) return <div>No club data available.</div>;

    return (
        <div className='pl-20 mt-10'>
            <div className='flex flex-row'>
                <div className='flex flex-col text-center ml-10'>
                    <Avatar alt="Club Image" src={club.clubIcon} sx={{ width: 245, height: 245 }} className='shadow-xl border-solid border-2 border-sky-500' />
                    <h1 className='mt-5 text-3xl font-semibold max-w-60'>{club.clubName}</h1>
                    <p><span className='text-blue-600 font-semibold'>President: </span>{president ? `${president.firstName} ${president.lastName}` : 'Loading President...'}</p>
                </div>
                <div className='flex flex-col ml-16 mt-10 max-w-4xl text-lg'>
                    <p>{club.clubDescription}</p>
                    <div className='flex flex-row mt-auto space-x-16'>
                        <Button variant="contained" className={visibleBoardMembers ? 'bg-green-500' : 'bg-blue-400'} onClick={handleBoardMembersClick}>Board Members List</Button>
                        <Button variant="contained" className={visibleClubEvents ? 'bg-green-500' : 'bg-blue-400'} onClick={handleClubEventsClick}>Club Events</Button>
                        <Button variant="contained" className={visibleEditClub ? 'bg-green-500' : 'bg-blue-400'} onClick={handleEditClubClick}>Edit Club</Button>
                        <Button variant="contained" className={visibleStatistics ? 'bg-green-500' : 'bg-blue-400'} onClick={handleStatisticsClick}>Statistics</Button>
                    </div>
                </div>
            </div>
            <div className='flex flex-row mt-10'>
                {visibleBoardMembers && <BoardMemberList club={club} />}
                {visibleStatistics && <Statiscics />}
                {visibleClubEvents && <ClubEvents />}
                {visibleEditClub && <EditClub />}
            </div>
        </div>
    );
};

export default ClubDetailsPage;