/**
 * Log Viewer Feature – Stub
 * TODO: implement real log streaming via Supabase realtime or WebSocket.
 */

import { useState } from 'react';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source?: string;
}

/** Stub hook – returns an empty log stream */
export function useRealLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const clear = () => setLogs([]);
  return { logs, connected: false, clear };
}

/** Minimal LogViewer component */
export function LogViewer({
  logs,
  connected,
  onClear,
}: {
  logs: LogEntry[];
  connected: boolean;
  onClear: () => void;
}) {
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
              <span className={l.level === 'error' ? 'text-red-500' : 'text-gray-300'}>
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
