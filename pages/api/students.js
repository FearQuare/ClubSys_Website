import { db } from '../../firebase/firebaseAdmin';

export default async function handler(req, res) {
    const { studentId } = req.query;

    if (req.method === 'GET' && studentId) {
        try {
            const studentDoc = db().collection('Students').doc(studentId);
            const doc = await studentDoc.get();
            if (!doc.exists) {
                res.status(404).json({ error: 'Student not found' });
            } else {
                res.status(200).json({ id: doc.id, ...doc.data() });
            }
        } catch (error) {
            console.error('Failed to retrieve student', error);
            res.status(500).json({ error: 'Failed to retrieve student' });
        }
    } else if (req.method === 'GET') {
        try {
            const studentsCollection = db().collection('Students');
            const snapshot = await studentsCollection.get();
            const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            res.status(200).json(students);
        } catch (error) {
            console.error('Failed to retrieve data', error);
            res.status(500).json({ error: 'Failed to retrieve data' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}