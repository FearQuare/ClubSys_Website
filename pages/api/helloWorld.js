export default async function handler(req, res) {
    if (req.method === 'GET') {
        return res.status(200).send('Hello World');
    }
}