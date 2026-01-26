import { useState, useEffect, useCallback } from 'react';

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

const STORAGE_KEY = 'conversation-progress';

const defaultModeProgress: ModeProgress = { completed: false };

const defaultProgress: ConversationProgress = {
  practice: defaultModeProgress,
  select: defaultModeProgress,
  structure: defaultModeProgress,
};

export function useConversationProgress() {
  const [progress, setProgress] = useState<ProgressState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const getProgress = useCallback((conversationId: string): ConversationProgress => {
    return progress[conversationId] || defaultProgress;
  }, [progress]);

  const completeMode = useCallback((conversationId: string, mode: LearningMode, score?: number) => {
    setProgress(prev => {
      const current = prev[conversationId] || defaultProgress;
      return {
        ...prev,
        [conversationId]: {
          ...current,
          [mode]: {
            completed: mode === 'select' ? (score === 100) : true,
            bestScore: mode === 'select' ? Math.max(score || 0, current.select.bestScore || 0) : undefined,
          },
        },
      };
    });
  }, []);

  const isModeUnlocked = useCallback((conversationId: string, mode: LearningMode): boolean => {
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
  }, [progress]);

  const getOverallProgress = useCallback((conversationId: string): number => {
    const conv = progress[conversationId] || defaultProgress;
    let completed = 0;
    if (conv.practice.completed) completed++;
    if (conv.select.completed) completed++;
    if (conv.structure.completed) completed++;
    return completed;
  }, [progress]);

  return {
    progress,
    getProgress,
    completeMode,
    isModeUnlocked,
    getOverallProgress,
  };
}
