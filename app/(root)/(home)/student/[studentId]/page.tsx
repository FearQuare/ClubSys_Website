'use client';

import { useParams } from "next/navigation";
import { useEffect } from "react";

interface RouteParams {
    studentId?: string;
}

const StudentDetailsPage = () => {
    const { studentId } = useParams() as RouteParams;

    useEffect(() => {
        if (!studentId) return;
    }, [studentId]);

    return (
        <>{studentId}</>
    );
}

export default StudentDetailsPage;