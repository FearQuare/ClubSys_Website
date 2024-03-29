import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

const useSessionCountdown = () => {
  const { data: session } = useSession();
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (session) {
      const intervalId = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            signOut({ redirect: false });
            clearInterval(intervalId);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [session]);

  return timeLeft;
};

export default useSessionCountdown;
