/**
 * useResizable - Hook for resizable elements
 */

import { useState, useCallback, useEffect } from 'react';

interface Size { width: number; height: number }

export function useResizable(initialSize: Size = { width: 700, height: 400 }) {
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const startSize = { ...size };
    const startPos = { x: 0, y: 0 };

    const onMove = (e: MouseEvent) => {
      if (startPos.x === 0) {
        startPos.x = e.clientX;
        startPos.y = e.clientY;
        return;
      }
      setSize({
        width: Math.max(400, startSize.width + (e.clientX - startPos.x)),
        height: Math.max(200, startSize.height + (e.clientY - startPos.y)),
      });
    };

    const onUp = () => setIsResizing(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isResizing, size]);

  return { size, isResizing, onResizeStart };
}
