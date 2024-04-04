import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user?: {
            uid?: string;
        } & DefaultSession['user'];
    }

    interface User {
        uid?: string;
    }

    interface JWT {
        uid?: string;
    }
}