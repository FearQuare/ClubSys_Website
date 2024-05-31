'use client'
import React, { useEffect, useState } from 'react';
import { Student } from '@/types/firestore';

const ClubStatistics = () => {

  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetch('/api/students')
      .then(res => res.json())
      .then((data: Student[]) => setStudents(data))
      .catch(error => console.error('Failed to fetch students', error));
  }, []);

  const countStudentsInClubs = () => {
    return students.filter(student => student.joinedClubList && student.joinedClubList.length > 0).length;
  };

  return (
    <div>
      <h1 className='font-semibold text-3xl bg-gradient-to-t from-color3 to-color4 text-gradient'>Clubs Satistics</h1>
      <div className='flex flex-row'>
        <div className='flex flex-col mt-4'>
          <div
            className='rounded-3xl bg-color5 text-center pt-2 pb-6 p-36 cursor-pointer'
          >
            <p className='mt-5 text-color6 text-lg font-bold'>Total Number of Students</p>
            <p className='mt-5 text-8xl font-bold'>{students.length}</p>
          </div>
          <div
            className='rounded-3xl bg-color5 text-center pt-2 pb-6 p-36 cursor-pointer mt-4'
          >
            <p className='mt-5 text-color6 text-lg font-bold'>Students Who Joined Clubs</p>
            <p className='mt-5 text-8xl font-bold'>{countStudentsInClubs()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClubStatistics