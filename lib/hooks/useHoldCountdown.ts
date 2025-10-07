import { useState, useEffect, useRef } from 'react';

export function useHoldCountdown(expiresAt: number | null) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft(0);
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const remaining = Math.max(0, expiresAt - now);
      setTimeLeft(remaining);

      if (remaining === 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };

    updateCountdown();
    intervalRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [expiresAt]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return {
    timeLeft,
    minutes,
    seconds,
    isExpired: timeLeft === 0,
    formatted: `${minutes}:${seconds.toString().padStart(2, '0')}`
  };
}

