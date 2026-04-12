import { useEffect, useState } from "react";

export function useCountdown(deadlineAt?: number) {
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (!deadlineAt) {
      setRemainingSeconds(0);
      return;
    }

    const update = () => {
      const delta = Math.max(0, deadlineAt - Date.now());
      setRemainingSeconds(Math.ceil(delta / 1000));
    };

    update();
    const interval = window.setInterval(update, 250);
    return () => window.clearInterval(interval);
  }, [deadlineAt]);

  return remainingSeconds;
}

