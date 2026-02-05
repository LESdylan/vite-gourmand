/**
 * ShellOutput - Terminal output display with auto-scroll
 */

import { useEffect, useRef } from 'react';

interface Props {
  lines: string[];
}

export function ShellOutput({ lines }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo(0, ref.current.scrollHeight);
  }, [lines]);

  return (
    <div className="shell-output" ref={ref}>
      {lines.map((line, i) => (
        <pre key={i}>{line}</pre>
      ))}
    </div>
  );
}
