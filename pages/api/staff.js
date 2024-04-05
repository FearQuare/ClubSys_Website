'use server'
import { getSession } from "next-auth/react";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const db = getFirestore();

export default async function handler(req, res) {
    const session = await getSession({ req });

    if(!session) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const uid = session.user?.uid;

    try {
        const staffDocRef = doc(db, 'HCS', uid);
        const staffDoc = await getDoc(staffDocRef);

        if (!staffDoc.exists()) {
            return res.status(404).json({ message: 'Staff data not found' });
        }

        const staffData = staffDoc.data();
        return res.status(200).json(staffData);
    } catch (error) {
        console.error('Error fetching staff data:', error);
        return res.status(500).json({ message: 'Error fetching staff data' });
    }
}