import { useEffect, useRef } from 'react';

export function usePolling(fn: () => void, ms: number) {
  const ref = useRef<number | null>(null);
  useEffect(() => {
    fn();
    ref.current = window.setInterval(fn, ms);
    return () => { if (ref.current) window.clearInterval(ref.current); };
  }, [fn, ms]);
}
