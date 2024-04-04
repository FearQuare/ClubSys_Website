'use server';
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const db = getFirestore();

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials): Promise<any> {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, (credentials as any).email || '', (credentials as any).password || '');

          // Check if the user exists in the HCS collection
          const hcsUserDoc = await getDoc(doc(db, "HCS", userCredential.user.uid));
          if (!hcsUserDoc.exists()) {
            throw new Error("User is not authorzed.")
          }

          return {
            email: userCredential.user.email,
            uid: userCredential.user.uid
          };
        } catch (error) {
          console.error(error);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.uid;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.uid === 'string') {
        session.user.uid = token.uid;
      }
      return session;
    }
    
  },
  session: {
    strategy: 'jwt',
    maxAge: 60,
  },
  pages: {
    signIn: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Additional NextAuth configuration...
});