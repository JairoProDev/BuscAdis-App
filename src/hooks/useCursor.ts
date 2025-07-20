'use client'

import { useEffect } from 'react'

// Define GSAP types
interface GSAP {
  to: (target: HTMLElement, vars: {
    x?: number;
    y?: number;
    duration?: number;
    ease?: string;
  }) => void;
}

// Conditionally import gsap if available
let gsap: GSAP | null = null;
try {
  gsap = require('gsap') as GSAP;
} catch {
  // gsap not available, hook will be disabled
}

export function useCursor() {
  useEffect(() => {
    if (!gsap || typeof window === 'undefined') {
      // Disable cursor effects if gsap is not available or on server
      return;
    }

    // Initialize cursor
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.8);
      pointer-events: none;
      z-index: 9999;
      mix-blend-mode: difference;
      transform: translate(-50%, -50%);
    `;
    document.body.appendChild(cursor);

    // Mouse move handler
    const onMouseMove = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: "power2.out"
      });
    };

    // Add event listener
    document.addEventListener('mousemove', onMouseMove);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      if (cursor.parentNode) {
        cursor.parentNode.removeChild(cursor);
      }
    };
  }, []);
} 