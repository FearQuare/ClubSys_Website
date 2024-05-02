import { db } from '../../firebase/firebaseAdmin';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const advisorsCollection = db().collection('Advisors');
            const snapshot = await advisorsCollection.get();
            const advisors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            res.status(200).json(advisors);
        } catch (error) {
            console.error('Failed to retrieve data', error);
            res.status(500).json({ error: 'Failed to retrieve data' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}