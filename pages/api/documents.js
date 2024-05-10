import { db } from '../../firebase/firebaseAdmin';

export default async function handler(req, res) {
    const { clubId } = req.query;
    const { eventId } = req.query;

    if (req.method == 'GET' && eventId) {
        try {
            const documentsCollection = db().collection('Documents').where('eventID', '==', eventId);
            const snapshot = await documentsCollection.get();
            if (snapshot.empty) {
                res.status(200).json({ error: 'No documents found for this club' });
            } else {
                const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                res.status(200).json(documents);
            }
        } catch (error) {
            console.error('Failed to retrieve clubs for the document', error);
            res.status(500).json({ error: 'Failed to retrieve clubs for the document' });
        }
    } else if (req.method == 'GET' && clubId) {
        try {
            const documentsCollection = db().collection('Documents').where('clubID', '==', clubId);
            const snapshot = await documentsCollection.get();
            if (snapshot.empty) {
                res.status(200).json({ error: 'No documents found for this club' });
            } else {
                const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                res.status(200).json(documents);
            }
        } catch (error) {
            console.error('Failed to retrieve clubs for the document', error);
            res.status(500).json({ error: 'Failed to retrieve clubs for the document' });
        }
    } else if (req.method === 'GET') {
        try {
            const documentsCollection = db().collection('Documents');
            const snapshot = await documentsCollection.get();
            const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            res.status(200).json(documents);
        } catch (error) {
            console.error('Failed to retrieve data', error);
            res.status(500).json({ error: 'Failed to retrieve data' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}