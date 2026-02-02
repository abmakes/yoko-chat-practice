import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { sampleConversations, type Conversation } from '@/data/conversations';
import { supabase } from '@/lib/supabase';

interface ConversationsContextValue {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  addConversation: (conversation: Conversation) => Promise<void>;
}

const ConversationsContext = createContext<ConversationsContextValue | null>(null);

function rowToConversation(row: {
  id: string;
  title: string;
  description?: string | null;
  unit?: string | null;
  lines: unknown;
}): Conversation {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    unit: row.unit ?? undefined,
    lines: Array.isArray(row.lines) ? (row.lines as Conversation['lines']) : [],
  };
}

export function ConversationsProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setConversations(sampleConversations);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchConversations() {
      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select('id, title, description, unit, lines')
        .order('created_at', { ascending: false });

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
        setConversations(sampleConversations);
        setIsLoading(false);
        return;
      }

      if (data && data.length > 0) {
        setConversations(data.map(rowToConversation));
      } else {
        setConversations(sampleConversations);
      }
      setError(null);
      setIsLoading(false);
    }

    fetchConversations();
    return () => {
      cancelled = true;
    };
  }, []);

  const addConversation = useCallback(async (conversation: Conversation) => {
    if (supabase) {
      const { error: insertError } = await supabase.from('conversations').insert({
        id: conversation.id,
        title: conversation.title,
        description: conversation.description ?? null,
        unit: conversation.unit ?? null,
        lines: conversation.lines,
      });

      if (insertError) {
        console.error('Failed to persist conversation:', insertError);
        setConversations((prev) => [...prev, conversation]);
        return;
      }
    }

    setConversations((prev) => [...prev, conversation]);
  }, []);

  return (
    <ConversationsContext.Provider
      value={{ conversations, isLoading, error, addConversation }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversations(): ConversationsContextValue {
  const ctx = useContext(ConversationsContext);
  if (!ctx) throw new Error('useConversations must be used within ConversationsProvider');
  return ctx;
}
