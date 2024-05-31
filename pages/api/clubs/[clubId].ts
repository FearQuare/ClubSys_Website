import { NextApiRequest, NextApiResponse } from 'next';
import { db, storage } from '@/firebaseConfig';
import { doc, getDoc, writeBatch, getDocs, query, collection, where, arrayRemove, deleteField } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'DELETE') {
        const { clubId } = req.query;

        if (!clubId || typeof clubId !== 'string') {
            return res.status(400).json({ message: 'Invalid or missing club ID.' });
        }

        const batch = writeBatch(db);

        try {
            const clubDocRef = doc(db, 'Clubs', clubId);
            const clubDoc = await getDoc(clubDocRef);
            if (!clubDoc.exists()) throw new Error('Club not found');

            const clubData = clubDoc.data();
            const memberList = clubData.memberList;

            for (const member of memberList) {
                const studentDocRef = doc(db, 'Students', member);
                const studentDoc = await getDoc(studentDocRef);
                if (studentDoc.exists()) {
                    const studentData = studentDoc.data();

                    if (studentData.followedClubList?.includes(clubId)) {
                        batch.update(studentDocRef, { followedClubList: arrayRemove(clubId) });
                    }

                    if (studentData.joinedClubList?.includes(clubId)) {
                        batch.update(studentDocRef, { joinedClubList: arrayRemove(clubId) });
                    }

                    if (studentData.boardMemberOf === clubId) {
                        batch.update(studentDocRef, { boardMemberOf: deleteField() });
                    }
                }
            }

            const feedDocRef = doc(db, 'Feed', clubId);
            batch.delete(feedDocRef);

            const interestsSnapshot = await getDocs(collection(db, 'Interests'));
            interestsSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.relatedClubs?.includes(clubId)) {
                    batch.update(doc.ref, { relatedClubs: arrayRemove(clubId) });
                }
            });

            const notificationsSnapshot = await getDocs(collection(db, 'Notifications'));
            notificationsSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.receiverID === clubId || data.senderID === clubId) {
                    batch.delete(doc.ref);
                }
            });

            const eventsSnapshot = await getDocs(query(collection(db, 'Events'), where('clubID', '==', clubId)));
            eventsSnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });

            const documentsSnapshot = await getDocs(query(collection(db, 'Documents'), where('clubID', '==', clubId)));
            documentsSnapshot.forEach(async (doc) => {
                const docData = doc.data();
                if (docData.filePath) {
                    const fileRef = ref(storage, docData.filePath);
                    await deleteObject(fileRef);
                }
                batch.delete(doc.ref);
            });

            batch.delete(clubDocRef);

            await batch.commit();

            res.status(200).json({ message: 'Club successfully deleted.' });
        } catch (error) {
            console.error('Error deleting club:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}