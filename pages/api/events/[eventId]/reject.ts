import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { eventId } = req.query;

    if (req.method === 'POST') {
        if (!eventId) {
            return res.status(400).json({ error: 'Event ID is missing.' });
        }

        try {
            const eventRef = doc(db, 'Events', eventId as string);
            await updateDoc(eventRef, {
                isApproved: false
            });
            return res.status(200).json({ message: 'Event successfully rejected.' });
        } catch (error) {
            console.error('Error rejecting event: ', error);
            return res.status(500).json({ error: 'Internal server error.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} not allowed.` });
    }
}
