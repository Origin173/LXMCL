import { RefObject, useEffect, useRef, useState } from "react";

export function useWidthAnimation(): [RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    let lastWidth = ref.current.offsetWidth;

    const observer = new ResizeObserver((entries) => {
      const currentWidth = entries[0].contentRect.width;

      if (Math.abs(currentWidth - lastWidth) > 1) {
        // 避免微小变化触发
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 700);
        lastWidth = currentWidth;
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isAnimating];
}
