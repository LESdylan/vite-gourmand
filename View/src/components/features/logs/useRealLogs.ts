import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../../../services/api';
import type { DevLogEntry } from './types';

interface LogsResponse {
  success?: boolean;
  data?: DevLogEntry[];
}

export function useRealLogs() {
  const [logs, setLogs] = useState<DevLogEntry[]>([]);
  const [connected, setConnected] = useState(false);

  const clear = useCallback(() => {
    setLogs([]);
    void apiRequest('/api/logs', { method: 'DELETE' }).catch(() => undefined);
  }, []);

  useEffect(() => {
    let closed = false;

    void apiRequest<LogsResponse | DevLogEntry[]>('/api/logs?limit=100')
      .then((response) => {
        if (closed) return;
        setLogs(Array.isArray(response) ? response : (response.data ?? []));
      })
      .catch(() => undefined);

    const events = new EventSource('/api/logs/stream', { withCredentials: true });
    events.onopen = () => setConnected(true);
    events.onerror = () => setConnected(false);
    events.onmessage = (event) => {
      try {
        const log = JSON.parse(event.data) as DevLogEntry;
        setLogs((current) => [...current.slice(-199), log]);
      } catch {
        // Ignore malformed stream events.
      }
    };

    return () => {
      closed = true;
      setConnected(false);
      events.close();
    };
  }, []);

  return { logs, connected, clear };
}
