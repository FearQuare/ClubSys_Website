import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import axios from 'axios';
import { Club, Student } from '@/types/firestore';

type BoardMemberListProps = {
    club: Club;
};

const BoardMemberList: React.FC<BoardMemberListProps> = ({ club }) => {
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const fetchStudents = async () => {
            const students: Student[] = await Promise.all(
                club.boardMembers.map(async (member) => {
                    const response = await axios.get(`/api/students?studentId=${member.studentID}`);
                    const { firstName, lastName } = response.data;
                    return {
                        id: member.studentID,
                        firstName,
                        lastName,
                        role: member.memberRole,
                        ...member.permissions
                    };
                })
            );
            setRows(students);
            setLoading(false);
        };
        fetchStudents();
    }, [club]);

    const columns: GridColDef[] = [
        { field: 'firstName', headerName: 'Name', width: 150 },
        { field: 'lastName', headerName: 'Surname', width: 150 },
        { field: 'role', headerName: 'Member Role', width: 150 },
        { field: 'canEdit', headerName: 'Can Edit', width: 130, type: 'boolean' },
        { field: 'canEventPost', headerName: 'Can Event Post', width: 150, type: 'boolean' },
        { field: 'canAddMembers', headerName: 'Can Add Members', width: 180, type: 'boolean' },
    ];

    return (
        <div style={{ height: 400, width: '100%' }}>
            <h1 className='font-semibold text-3xl bg-gradient-to-t from-color3 to-color4 text-gradient basis-2/5'>Board Members List</h1>
            <DataGrid
                rows={rows}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 25 },
                    },
                }}
                pageSizeOptions={[25, 40]}
                loading={loading}
            />
        </div>
    );
}

export default BoardMemberList;