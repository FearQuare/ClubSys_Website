'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Club, Student } from '@/types/firestore';

type StatisticsProps = {
    club: Club;
}

const Statistics: React.FC<StatisticsProps> = ({ club }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchStudents = async (memberList: string[]) => {
        setLoading(true);
        try {
            const studentPromises = memberList.map(memberId => axios.get(`/api/students?studentId=${memberId}`));
            const studentResponses = await Promise.all(studentPromises);
            const studentData = studentResponses.map(response => response.data);
            setStudents(studentData);
        } catch (error) {
            console.error('Failed to retrieve student data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isModalOpen) {
            fetchStudents(club.memberList);
        }
    }, [isModalOpen, club.memberList]);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div>
            <h1 className='font-semibold text-3xl bg-gradient-to-t from-color3 to-color4 text-gradient basis-2/5'>Statistics</h1>
            <div className='flex flex-row mt-10'>
                <div className='flex flex-col'>
                    <div
                        className='rounded-3xl bg-color5 text-center pt-2 pb-6 p-36 cursor-pointer'
                        onClick={openModal}
                    >
                        <p className='mt-5 text-color6 text-lg font-bold'>Number of All Members</p>
                        <p className='mt-5 text-8xl font-bold'>{club.memberList.length}</p>
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
                    <div className='bg-white rounded-lg p-8 w-1/2 h-1/2'>
                        <h2 className='text-xl font-bold mb-4'>Member List</h2>
                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <ul>
                                {students.map((student) => (
                                    <li key={student.id} className='mb-2'>{student.firstName} {student.lastName}</li>
                                ))}
                            </ul>
                        )}
                        <button
                            className='mt-4 px-4 py-2 bg-red-500 text-white rounded-lg'
                            onClick={closeModal}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Statistics;