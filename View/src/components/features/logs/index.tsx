/**
 * Log Viewer Feature — streams CDC events from realtime-agnostic
 * via the useRealtimeChannel hook. Displays live database changes
 * for any subscribed table.
 */

import { useMemo } from 'react';

import useRealtimeChannel from '../../../hooks/useRealtimeChannel';
import type { RealtimeEvent } from '../../../lib/realtime';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source?: string;
}

/** Map a CDC event to a human-readable LogEntry */
function cdcToLog(event: RealtimeEvent): LogEntry {
  let level: LogEntry['level'] = 'debug';
  if (event.type === 'DELETE') level = 'warn';
  else if (event.type === 'UPDATE') level = 'info';

  return {
    id: crypto.randomUUID(),
    timestamp: new Date(event.timestamp * 1000).toISOString(),
    level,
    message: `${event.type} on ${event.schema}.${event.table}`,
    source: event.table,
  };
}

/**
 * Hook that returns live CDC logs for a given table.
 * Defaults to watching all generic BaaS tables via "posts".
 * Pass a different table name to watch something else.
 */
export function useRealLogs(table = 'posts') {
  const { events, connected, clear } = useRealtimeChannel(table, {
    adapter: 'postgresql',
    maxEvents: 200,
  });

  const logs: LogEntry[] = useMemo(() => events.map(cdcToLog), [events]);

  return { logs, connected: connected === 'connected', clear };
}

/** CSS class for a log level badge */
function levelClass(level: LogEntry['level']): string {
  if (level === 'error') return 'text-red-500';
  if (level === 'warn') return 'text-yellow-500';
  return 'text-gray-300';
}

/** Minimal LogViewer component */
export function LogViewer({
  logs,
  connected,
  onClear,
}: Readonly<{
  logs: LogEntry[];
  connected: boolean;
  onClear: () => void;
}>) {
  return (
    <div className="p-4 font-mono text-sm">
      <div className="flex items-center justify-between mb-2">
        <span className={connected ? 'text-green-600' : 'text-gray-400'}>
          {connected ? '● Connecté' : '○ Déconnecté'}
        </span>
        <button onClick={onClear} className="text-xs underline">
          Effacer
        </button>
      </div>
      {logs.length === 0 ? (
        <p className="text-gray-500">Aucun log disponible.</p>
      ) : (
        <ul className="space-y-1">
          {logs.map((l) => (
            <li key={l.id} className="flex gap-2">
              <span className="text-gray-400">{l.timestamp}</span>
              <span
                className={levelClass(l.level)}
              >
                [{l.level}]
              </span>
              <span>{l.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
