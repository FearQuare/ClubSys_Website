'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Student, Club, Interest, Events } from "@/types/firestore";

interface RouteParams {
    studentId?: string;
}

const StudentDetailsPage = () => {
    const { studentId } = useParams() as RouteParams;
    const [student, setStudent] = useState<Student>();
    const [clubs, setClubs] = useState<Club[]>([]);
    const [interests, setInterests] = useState<Interest[]>([]);
    const [events, setEvents] = useState<Events[]>([]);

    useEffect(() => {
        if (!studentId) return;

        fetch(`/api/students?studentId=${studentId}`)
            .then(res => res.json())
            .then((data: Student) => setStudent(data))
            .catch(error => console.error('Failed to fetch student', error));

        fetch(`/api/clubs`)
            .then(res => res.json())
            .then((data: Club[]) => setClubs(data))
            .catch(error => console.error('Failed to fetch clubs', error));

        fetch(`/api/interests`)
            .then(res => res.json())
            .then((data: Interest[]) => setInterests(data))
            .catch(error => console.error('Failed to fetch clubs', error));

        fetch(`/api/events`)
            .then(res => res.json())
            .then((data: Events[]) => setEvents(data))
            .catch(error => console.error('Failed to fetch events', error));

    }, [studentId]);

    const renderClubs = (clubsArray: string[] | undefined) => {
        if (clubsArray?.length === 0) {
            return <p className='mt-3 text-xl font-bold'>No clubs joined</p>;
        }

        return (
            <>
                {clubsArray?.map((clubID) => {
                    let matchedClubName = '';
                    clubs.forEach((club) => {
                        if (club.id === clubID) {
                            matchedClubName = club.clubName;
                        }
                    });

                    if (matchedClubName.length === 0) {
                        return <p key={clubID} className='mt-3 text-xl font-bold'>The club with ID of {clubID} does not exist</p>;
                    }

                    return <p key={clubID} className='mt-3 text-xl font-bold'>{matchedClubName}</p>;
                })}
            </>
        );
    };

    const renderInterests = () => {
        let found = false;

        const elements = interests.map((interest) => {
            const studentIDs = Array.isArray(interest.studentIDs) ? interest.studentIDs : [];
            return studentIDs.map((student) => {
                if (student === studentId) {
                    found = true;
                    return <p className='mt-3 text-xl font-bold' key={interest.id}>{interest.interestName}</p>
                }
            })
        }).flat().filter(item => item !== null);
        if (!found) {
            return <p className='mt-3 text-xl font-bold'>This student didn't choose interest.</p>;
        }
    
        return <>{elements}</>;
    }

    const renderEvents = () => {
        let found = false;
    
        const elements = events.map((event) => {
            const attendance = Array.isArray(event.attendance) ? event.attendance : [];
            return attendance.map((attendant) => {
                if (attendant.studentID === studentId) {
                    found = true;
                    return <p className='mt-3 text-xl font-bold' key={event.id}>{event.eventName}</p>;
                }
                return null;
            });
        }).flat().filter(item => item !== null);
        if (!found) {
            return <p className='mt-3 text-xl font-bold'>This student never attended the events.</p>;
        }
    
        return <>{elements}</>;
    }
    
    
    

    return (
        <div className="pl-20 mt-10">
            <h1 className='font-semibold text-3xl bg-gradient-to-t from-color3 to-color4 text-gradient'>Student Details: {student?.firstName} {student?.lastName}</h1>
            <div className="flex flex-row mt-4">
                <div className="flex flex-col w-full">
                    <div className='rounded-3xl bg-color5 text-center pt-2 pb-6 shadow-lg'>
                        <p className='mt-5 text-color6 text-xl font-bold'>Email</p>
                        <p className='mt-3 text-xl font-bold'>{student?.email}</p>
                    </div>
                    <div className='rounded-3xl bg-color5 text-center pt-2 pb-6 shadow-lg mt-4'>
                        <p className='mt-5 text-color6 text-xl font-bold'>Disability</p>
                        <p className='mt-3 text-xl font-bold'>{student?.isDisable ? 'The student has disability.' : 'The student does not have any disability.'}</p>
                    </div>
                    <div className='rounded-3xl bg-color5 text-center pt-2 pb-6 shadow-lg mt-4'>
                        <p className='mt-5 text-color6 text-xl font-bold'>Student ID</p>
                        <p className='mt-3 text-xl font-bold'>{student?.studentID}</p>
                    </div>
                </div>
                <div className="flex flex-col ml-4 w-full mr-4">
                    <div className='rounded-3xl bg-color5 text-center pt-2 pb-6 shadow-lg scrollable-event-details' style={{ height: '11.5rem', overflowY: 'auto' }}>
                        <p className='mt-5 text-color6 text-xl font-bold'>Joined Clubs</p>
                        {renderClubs(student?.joinedClubList)}
                    </div>
                    <div className='rounded-3xl bg-color5 text-center pt-2 pb-6 shadow-lg mt-4 scrollable-event-details' style={{ height: '11.75rem', overflowY: 'auto' }}>
                        <p className='mt-5 text-color6 text-xl font-bold'>Followed Clubs</p>
                        {renderClubs(student?.followedClubList)}
                    </div>
                </div>
            </div>
            <div className="flex flex-row mt-4">
                <div className="flex flex-col w-full h-full">
                    <div className='rounded-3xl bg-color5 text-center pt-2 pb-6 shadow-lg scrollable-event-details' style={{ overflowY: 'auto', height: '19rem' }}>
                        <p className='mt-5 text-color6 text-xl font-bold'>Interests</p>
                        {renderInterests()}
                    </div>
                </div>
                <div className="flex flex-col w-full ml-4 mr-4 h-full">
                    <div className='rounded-3xl bg-color5 text-center pt-2 pb-6 shadow-lg scrollable-event-details' style={{ overflowY: 'auto', height: '19rem' }}>
                        <p className='mt-5 text-color6 text-xl font-bold'>Events for {student?.firstName} {student?.lastName}</p>
                        {renderEvents()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentDetailsPage;