import { db } from '../../firebase/firebaseAdmin';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const interestsCollection = db().collection('Interests');
            const snapshot = await interestsCollection.get();
            const interests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            res.status(200).json(interests);
        } catch (error) {
            console.error('Failed to retrieve data', error);
            res.status(500).json({ error: 'Failed to retrieve data' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}