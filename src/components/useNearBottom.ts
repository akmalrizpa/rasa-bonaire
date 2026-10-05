"use client";

import { useEffect, useState } from "react";

/**
 * True when the page is scrolled close to the end. Used by the fixed action bars
 * on phones so they slide away before covering the footer.
 */
export function useNearBottom(offset = 130): boolean {
  const [nearBottom, setNearBottom] = useState(false);

  useEffect(() => {
    const update = () => {
      const distance =
        document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      setNearBottom(distance < offset);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [offset]);

  return nearBottom;
}
