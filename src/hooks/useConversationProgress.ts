import { useState, useEffect, useCallback } from 'react';
import { getStoredStudentKey } from '@/lib/studentIdentity';
import { supabase } from '@/lib/supabase';

export type LearningMode = 'practice' | 'select' | 'structure';

export interface ModeProgress {
  completed: boolean;
  bestScore?: number; // percentage for select mode
}

export interface ConversationProgress {
  practice: ModeProgress;
  select: ModeProgress;
  structure: ModeProgress;
}

export interface ProgressState {
  [conversationId: string]: ConversationProgress;
}

const defaultModeProgress: ModeProgress = { completed: false };

const defaultProgress: ConversationProgress = {
  practice: defaultModeProgress,
  select: defaultModeProgress,
  structure: defaultModeProgress,
};

export function useConversationProgress() {
  const studentKey = getStoredStudentKey();
  const [progress, setProgress] = useState<ProgressState>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch progress from Supabase when studentKey is available
  useEffect(() => {
    if (!studentKey) {
      setProgress({});
      setIsLoading(false);
      return;
    }

    if (!supabase) {
      setProgress({});
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchProgress() {
      const { data, error } = await supabase
        .from('progress')
        .select('data')
        .eq('student_key', studentKey)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        console.error('Failed to fetch progress:', error);
        setIsLoading(false);
        return;
      }
      setProgress((data?.data as ProgressState) ?? {});
      setIsLoading(false);
    }

    fetchProgress();
    return () => {
      cancelled = true;
    };
  }, [studentKey]);

  const persistProgress = useCallback(
    async (newProgress: ProgressState) => {
      if (!studentKey || !supabase) return;
      await supabase.from('progress').upsert(
        {
          student_key: studentKey,
          data: newProgress,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'student_key' }
      );
    },
    [studentKey]
  );

  const getProgress = useCallback((conversationId: string): ConversationProgress => {
    return progress[conversationId] || defaultProgress;
  }, [progress]);

  const completeMode = useCallback(
    (conversationId: string, mode: LearningMode, score?: number) => {
      setProgress((prev) => {
        const current = prev[conversationId] || defaultProgress;
        const next: ProgressState = {
          ...prev,
          [conversationId]: {
            ...current,
            [mode]: {
              completed: mode === 'select' ? score === 100 : true,
              bestScore:
                mode === 'select'
                  ? Math.max(score ?? 0, current.select.bestScore ?? 0)
                  : undefined,
            },
          },
        };
        persistProgress(next);
        return next;
      });
    },
    [persistProgress]
  );

  const isModeUnlocked = useCallback(
    (conversationId: string, mode: LearningMode): boolean => {
      const conv = progress[conversationId] || defaultProgress;
      switch (mode) {
        case 'practice':
          return true;
        case 'select':
          return conv.practice.completed;
        case 'structure':
          return conv.select.completed && conv.select.bestScore === 100;
        default:
          return false;
      }
    },
    [progress]
  );

  const getOverallProgress = useCallback(
    (conversationId: string): number => {
      const conv = progress[conversationId] || defaultProgress;
      let completed = 0;
      if (conv.practice.completed) completed++;
      if (conv.select.completed) completed++;
      if (conv.structure.completed) completed++;
      return completed;
    },
    [progress]
  );

  return {
    progress,
    isLoading,
    getProgress,
    completeMode,
    isModeUnlocked,
    getOverallProgress,
  };
}
