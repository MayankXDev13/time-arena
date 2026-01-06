import { useCallback } from 'react';
import { useSessionStore } from '@/stores/useSessionStore';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Session } from '@/types';

export function useSessions() {
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

      if (session.userId) {
        const supabase = getSupabaseClient();
        if (supabase) {
          try {
            const { error } = await supabase.from('sessions').insert({
              id: newSession.id,
              user_id: session.userId,
              start: newSession.start.toISOString(),
              ended_at: newSession.endedAt?.toISOString() ?? null,
              duration: newSession.duration,
              created_at: newSession.createdAt.toISOString(),
            } as any);

            if (error) {
              console.error('Failed to sync session to Supabase:', error);
            }
          } catch (err) {
            console.error('Error syncing session:', err);
          }
        }
      }

      return newSession;
    },
    [addSession]
  );

  const endSession = useCallback(
    async (id: string, endTime: Date = new Date(), duration: number) => {
      updateSession(id, { endedAt: endTime, duration });

      const session = sessions.find((s) => s.id === id);
      if (session?.userId) {
        const supabase = getSupabaseClient();
        if (supabase) {
          try {
            const { error } = await supabase
              .from('sessions')
              .update({
                ended_at: endTime.toISOString(),
                duration,
              } as any)
              .eq('id', id)
              .eq('user_id', session.userId);

            if (error) {
              console.error('Failed to update session in Supabase:', error);
            }
          } catch (err) {
            console.error('Error updating session:', err);
          }
        }
      }
    },
    [sessions, updateSession]
  );

  const deleteSession = useCallback(
    async (id: string) => {
      const session = sessions.find((s) => s.id === id);
      removeSession(id);

      if (session?.userId) {
        const supabase = getSupabaseClient();
        if (supabase) {
          try {
            const { error } = await supabase
              .from('sessions')
              .delete()
              .eq('id', id)
              .eq('user_id', session.userId);

            if (error) {
              console.error('Failed to delete session from Supabase:', error);
            }
          } catch (err) {
            console.error('Error deleting session:', err);
          }
        }
      }
    },
    [sessions, removeSession]
  );

  const loadSessions = useCallback(
    async (userId: string) => {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', userId)
          .order('start', { ascending: false });

        if (error) {
          console.error('Failed to load sessions:', error);
          return;
        }

        if (data) {
          const loadedSessions: Session[] = data.map((s: any) => ({
            id: s.id,
            userId: s.user_id,
            start: new Date(s.start),
            endedAt: s.ended_at ? new Date(s.ended_at) : null,
            duration: s.duration,
            createdAt: new Date(s.created_at),
          }));

          setSessions(loadedSessions);
        }
      } catch (err) {
        console.error('Error loading sessions:', err);
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
