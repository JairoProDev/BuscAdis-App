'use client'

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function useCursor() {
  const cursorRef = useRef<HTMLElement>(null);
  const cursorFollowerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!cursorRef.current || !cursorFollowerRef.current) return;

    const cursor = cursorRef.current;
    const cursorFollower = cursorFollowerRef.current;

    // GSAP animation for cursor
    gsap.set(cursorFollower, {
      xPercent: -50,
      yPercent: -50,
    });

    const handleMouseMove = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
      });

      gsap.to(cursorFollower, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return { cursorRef, cursorFollowerRef };
} 