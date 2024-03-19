// pages/api/auth/[...nextauth].ts
'use server';
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { collection, query, where, getDocs } from "firebase/firestore";  // Import Firestore to interact with the database
import db from "@/firebaseConfig";

// Initialize Firestore or import your initialized instance
const firestore = db;

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Username" },
        password: { label: "Password", type: "password", placeholder: "Password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        // Here, you add the logic to check the credentials against Firestore
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('username', '==', credentials.username));
        const userSnapshot = await getDocs(q);

        if (userSnapshot.empty) {
          throw new Error('No user found');
        }

        const user = userSnapshot.docs[0].data();

        // You should implement secure password verification here
        // For demonstration, we're just checking if the passwords match
        if (user.password === credentials.password) {
          return { id: user.id, name: user.username, email: user.email };
        } else {
          throw new Error('Invalid credentials');
        }
      },
    }),
  ],
  session: {
    // Define session behavior here
  },
  pages: {
    signIn: '/auth/signin',  // Specify the custom sign-in page
    error: '/auth/error',    // Specify the error page
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Additional NextAuth configuration...
});
