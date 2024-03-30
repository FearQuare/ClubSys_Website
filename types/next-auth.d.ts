import 'next-auth';

declare module 'next-auth' {
  /**
   * Represents a user's session.
   */
  interface Session {
    accessToken?: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}
