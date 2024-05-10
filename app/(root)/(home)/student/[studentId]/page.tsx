'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Student, Club } from "@/types/firestore";

interface RouteParams {
    studentId?: string;
}

const StudentDetailsPage = () => {
    const { studentId } = useParams() as RouteParams;
    const [student, setStudent] = useState<Student>();
    const [clubs, setClubs] = useState<Club[]>([]);

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

    }, [studentId]);

    const renderClubs = (clubsArray: string[] | undefined) => {
        if (clubsArray?.length == 0) {
            return <p className='mt-3 text-xl font-bold'>No clubs joined</p>;
        }

        return (
            <>
                {clubsArray?.map((clubID) => {
                    let matchedClubName = '';
                    clubs.forEach((club) => {
                        if (club.id == clubID) {
                            matchedClubName = club.clubName;
                        }
                    })
                    if (matchedClubName.length == 0) {
                        return <p className='mt-3 text-xl font-bold'>The club with ID of {clubID} does not exist</p>
                    }

                    return <p className='mt-3 text-xl font-bold'>{matchedClubName}</p>
                })}
            </>
        );
    };



    return (
        <div className="pl-20 mt-10">
            <h1 className='font-semibold text-3xl bg-gradient-to-t from-color3 to-color4 text-gradient'>Student Details: {student?.firstName} {student?.lastName}</h1>
            <div className="flex flex-row mt-4">
                <div className="flex flex-col w-1/3">
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
                <div className="flex flex-col ml-4 w-1/3">
                    <div className='rounded-3xl bg-color5 text-center pt-2 pb-6 shadow-lg' style={{ height: '11.5rem'}}>
                        <p className='mt-5 text-color6 text-xl font-bold'>Joined Clubs</p>
                        {renderClubs(student?.joinedClubList)}
                    </div>
                    <div className='rounded-3xl bg-color5 text-center pt-2 pb-6 shadow-lg mt-4' style={{ height: '11.75rem'}}>
                        <p className='mt-5 text-color6 text-xl font-bold'>Followed Clubs</p>
                        {renderClubs(student?.followedClubList)}
                    </div>
                </div>
                <div className="flex flex-col w-1/3">

                </div>
            </div>
        </div>
    );
}

export default StudentDetailsPage;