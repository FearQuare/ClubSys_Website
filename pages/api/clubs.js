import { db } from '../../firebase/firebaseAdmin';

export default async function handler(req, res) {
  const { clubId } = req.query;  // This is the Firestore document ID passed as a query parameter

  if (req.method === 'GET' && clubId) {
    try {
      // Fetching a specific club by Firestore document ID
      const clubDoc = db().collection('Clubs').doc(clubId);
      const doc = await clubDoc.get();
      if (!doc.exists) {
        // If no document found for the given Firestore document ID, return 404
        res.status(404).json({ error: 'Club not found' });
      } else {
        // Return the document if found
        res.status(200).json({ id: doc.id, ...doc.data() });
      }
    } catch (error) {
      console.error('Failed to retrieve club', error);
      res.status(500).json({ error: 'Failed to retrieve club' });
    }
  } else if (req.method === 'GET') {
    // Listing all clubs without specific ID
    try {
      const clubsCollection = db().collection('Clubs');
      const snapshot = await clubsCollection.get();
      const clubs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(clubs);
    } catch (error) {
      console.error('Failed to retrieve data', error);
      res.status(500).json({ error: 'Failed to retrieve data' });
    }
  } else {
    // Responding with Allowed Methods
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
