import { db } from '../../firebase/firebaseAdmin';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const notificationsCollection = db().collection('Notifications');
            const snapshot = await notificationsCollection.get();
            const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            res.status(200).json(notifications);
        } catch (error) {
            console.error('Failed to retrieve data', error);
            res.status(500).json({ error: 'Failed to retrieve data' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}