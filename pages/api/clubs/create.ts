import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/firebaseConfig';
import { doc, addDoc, updateDoc, getDoc, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const {
            advisorID,
            boardMembers,
            clubDescription,
            clubIcon,
            clubName,
            memberList,
            interestID,
        } = req.body;

        try {
            const clubQuerySnapshot = await getDocs(query(collection(db, 'Clubs'), where('clubName', '==', clubName.trim())));
            if (!clubQuerySnapshot.empty) {
                return res.status(400).json({ message: 'This club name already exists. Try another name.' });
            }

            const studentRef = doc(db, "Students", memberList[0]);
            const studentDoc = await getDoc(studentRef);
            if (studentDoc.exists() && studentDoc.data().boardMemberOf) {
                return res.status(400).json({ message: 'The selected president is already a board member of another club.' });
            }

            const clubDoc = {
                advisorID,
                boardMembers,
                clubDescription,
                clubIcon,
                clubName,
                memberList,
            };

            const clubRef = await addDoc(collection(db, "Clubs"), clubDoc);

            await updateDoc(studentRef, {
                boardMemberOf: clubRef.id,
                followedClubList: arrayUnion(clubRef.id),
                joinedClubList: arrayUnion(clubRef.id),
            });

            const interestRef = doc(db, "Interests", interestID);
            await updateDoc(interestRef, {
                relatedClubs: arrayUnion(clubRef.id),
            });

            return res.status(200).json({ clubId: clubRef.id });
        } catch (error) {
            console.error('Error creating club:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}