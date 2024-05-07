export interface Advisors {
    id: string;
    advisorLastName: string;
    advisorName: string;
    advisorPhoneNumber: string;
}

export interface Club {
    id: string;
    advisorID: string;
    boardMembers: BoardMember[];
    clubDescription: string;
    clubIcon: string;
    clubName: string;
    memberList: string[];
    feedbacks: Feedback[];
}

export interface BoardMember {
    memberRole: string;
    permissions: Permissions;
    studentID: string;
}

export interface Permissions {
    canAddMembers: boolean;
    canEdit: boolean;
    canEventPost: boolean;
}

export interface Feedback {
    feedback: string;
    studentID: string;
    point: number;
}

export interface Document {
    id: string;
    clubID: string;
    dateTime: {
        _seconds: number;
        _nanoseconds: number;
    };
    fileName: string;
    filePath: string;
    fileURL: string;
    eventID: string;
}

export interface Events {
    id: string;
    attendance: AttendanceData[];
    clubID: string;
    eventDate: {
        _seconds: number;
        _nanoseconds: number;
    };
    eventDescription: string;
    eventLocation: {
        _latitude: number;
        _longtitude: number;
    };
    eventName: string;
    eventType: string;
    feedbacks: Feedback[];
    isApproved: boolean;
    isPublic: boolean;
    paymentInfo: {
        amount: number;
        isFree: true;
    }
}

export interface AttendanceData {
    isAttended: boolean;
    isPaid: boolean;
    studentID: string;
}

export interface Student {
    id: string;
    firstName: string;
    lastName: string;
}