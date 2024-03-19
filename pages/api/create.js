import db from '@/firebaseConfig.ts';

const firebase = await db;

export default async function handler(req, res) {
    if (req.method === 'POST') {
      try {
        await db.collection('HCS').doc('/' + req.body.id + '/')
        .create({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price
        })

        return res.status(200).send();

      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    } else {
      // Handle any other HTTP methods
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }