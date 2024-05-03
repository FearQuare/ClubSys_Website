'use client';
import React from 'react';

type StatisticsProps = {
    club: Club;
}

interface Club {
    id: string;
    memberList: string[];
}

const Statistics: React.FC<StatisticsProps> = ({ club }) => {
    return (
        <div>
            <h1 className='font-semibold text-3xl bg-gradient-to-t from-color3 to-color4 text-gradient basis-2/5'>Statistics</h1>
            <div className='flex flex-row mt-10'>
                <div className='rounded-3xl bg-color5 text-center pt-2 pb-6 p-36'>
                    <p className='mt-5 text-color6 text-lg font-bold'>Number of All Members</p>
                    <p className='mt-5 text-8xl font-bold'>{club.memberList.length}</p>
                </div>
            </div>
        </div>
    );
}

export default Statistics;