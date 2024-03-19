import firestore from '../../app/firebase/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const snapshot = await firestore.collection('HCS').get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      res.status(200).json(data);
    } catch (error) {
      console.error('Firestore error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    // Handle any other HTTP methods
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
