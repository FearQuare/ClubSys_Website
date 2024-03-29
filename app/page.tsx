// app/page.tsx
'use client'
import { useSession } from 'next-auth/react';
import useSessionCountdown from '@/hooks/useSessionCountdown';

export default function Home() {
  const { data: session, status } = useSession();
  const timeLeft = useSessionCountdown();

  if (status === "loading") {
    return <p>Loading...</p>; // Show a loading state while the session is being determined
  }

  return (
    <div>
      {session ? (
        <>
          <p>Welcome, {session.user?.name || 'Guest'}</p>
          <p>Session ends in: {timeLeft} seconds</p>
        </>
      ) : (
        <p><a href="/login">Login</a></p>
      )}
    </div>
  );
}
