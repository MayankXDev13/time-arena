import { useCallback } from 'react';
import { useSessionStore } from '@/stores/useSessionStore';
import type { Session } from '@/types';
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react';

interface SessionData {
  id: string;
  user_id: string;
  start: string;
  ended_at: string | null;
  duration: number;
  created_at: string;
}

export function useSessions() {
  const convex = useConvex();
  const { sessions, addSession, updateSession, removeSession, setSessions } =
    useSessionStore();

  const createSession = useCallback(
    async (session: Omit<Session, 'id' | 'createdAt'>): Promise<Session> => {
      const newSession: Session = {
        ...session,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      };

      addSession(newSession);
      return newSession;
    },
    [addSession]
  );

  const endSession = useCallback(
    async (id: string, endTime: Date = new Date(), duration: number) => {
      updateSession(id, { endedAt: endTime, duration });
    },
    [updateSession]
  );

  const deleteSession = useCallback(
    async (id: string) => {
      removeSession(id);
      await convex.mutation(api.sessions.remove, { id: id as any });
    },
    [removeSession, convex]
  );

  const loadSessions = useCallback(
    async (userId: string) => {
      const stored = localStorage.getItem(`time-arena-sessions-${userId}`);
      if (stored) {
        const data = JSON.parse(stored);
        const loadedSessions: Session[] = data.map((s: SessionData) => ({
          id: s.id,
          userId: s.user_id,
          start: new Date(s.start),
          endedAt: s.ended_at ? new Date(s.ended_at) : null,
          duration: s.duration,
          createdAt: new Date(s.created_at),
        }));
        setSessions(loadedSessions);
      }
    },
    [setSessions]
  );

  return {
    sessions,
    createSession,
    endSession,
    deleteSession,
    loadSessions,
  };
}