import type { NextApiRequest, NextApiResponse } from "next";
import { collection, query, where, getDocs } from "firebase/firestore";
import { signIn } from "next-auth/react";
import db from "@/firebaseConfig";

const firestore = db;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { username, password } = req.body;

        // Validate the input
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        try {
            // Here, add the logic to authenticate the user with Firestore
            const usersRef = collection(firestore, 'HCS');
            const q = query(usersRef, where('staffMailAddress', '==', username));
            const userSnapshot = await getDocs(q);

            if (userSnapshot.empty) {
                return res.status(401).json({ message: 'No user found' });
            }

            const user = userSnapshot.docs[0].data();

            // Implement secure password verification (use bcrypt in a real application)
            if (user.password === password) {
                // Use NextAuth.js for session handling
                const result = await signIn('credentials', { redirect: false, username, password });

                if (result?.ok) {
                    res.status(200).json({ message: 'Logged in successfully' });
                } else {
                    res.status(401).json({ message: 'Login failed' });
                }
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        // Handle any other HTTP method
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}