import { NextApiRequest, NextApiResponse } from 'next';
import { storage, db } from '@/firebaseConfig';
import { ref, deleteObject } from 'firebase/storage';
import { doc, deleteDoc } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'DELETE') {
        const { id } = req.query;
        const { filePath } = req.body;

        if (!id || !filePath) {
            return res.status(400).json({ message: 'Missing document ID or file path.' });
        }

        try {
            await deleteDoc(doc(db, 'Documents', id as string));

            const fileRef = ref(storage, filePath);
            await deleteObject(fileRef);

            return res.status(200).json({ message: 'Document successfully deleted.' });
        } catch (error) {
            console.error('Error deleting document:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}