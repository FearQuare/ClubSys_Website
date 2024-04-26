import { db } from '../../firebase/firebaseAdmin';

export default async function handler(req, res) {
    const { eventId } = req.query;

    if (req.method == 'GET' && eventId) {
        try {
            const eventDoc = db().collection('Events').doc(eventId);
            const doc = await eventDoc.get();
            if (!doc.exists) {
                res.status(200).json({ error: 'Event not found' });
            } else {
                res.status(200).json({ id: doc.id, ...doc.data() });
            }
        } catch (error) {
            console.error('Failed to retrieve event', error);
            res.status(500).json({ error: 'Failed to retrieve event' });
        }
    } else if (req.method === 'GET') {
        try {
            const eventsCollection = db().collection('Events');
            const snapshot = await eventsCollection.get();
            const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            res.status(200).json(events);
        } catch (error) {
            console.error('Failed to retrieve data', error);
            res.status(500).json({ error: 'Failed to retrieve data' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}