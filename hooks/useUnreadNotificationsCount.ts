import { useState, useEffect } from 'react';
import { Notification } from '@/types/firestore';

const useUnreadNotificationsCount = (receiverID: string) => {
    const [count, setCount] = useState<number>(0);

    useEffect(() => {
        const fetchNotificationsCount = async () => {
            try {
                const response = await fetch('/api/notifications');
                const data = await response.json();
                const unreadCount = data.filter((notification: Notification) => 
                    notification.status === false && notification.receiverID === receiverID
                ).length;
                setCount(unreadCount);
            } catch (error) {
                console.error('Failed to fetch notifications count', error);
            }
        };

        fetchNotificationsCount();
    }, [receiverID]);

    return count;
};

export default useUnreadNotificationsCount;
