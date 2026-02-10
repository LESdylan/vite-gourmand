/**
 * LazyImage — Image with skeleton placeholder
 * 
 * Shows a shimmer/skeleton placeholder while the image loads,
 * then fades in the actual image. Falls back to a neutral placeholder
 * if the image fails to load.
 */
import { useState, useCallback } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format';

export default function LazyImage({ src, alt, className = '', fallback = DEFAULT_FALLBACK }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => setLoaded(true), []);
  const handleError = useCallback(() => {
    setError(true);
    setLoaded(true); // Stop showing skeleton on error too
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton placeholder — visible while loading */}
      {!loaded && (
        <div className="absolute inset-0 bg-[#1A1A1A]/5 animate-pulse">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'lazyImageShimmer 1.5s ease-in-out infinite',
            }}
          />
        </div>
      )}

      {/* Actual image */}
      <img
        src={error ? fallback : src}
        alt={alt}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <style>{`
        @keyframes lazyImageShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
