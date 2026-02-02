import { useState, useRef, useEffect } from 'react';
import { Conversation } from '@/data/conversations';
import { ChatBubble } from './ChatBubble';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface PracticeModeProps {
  conversation: Conversation;
  showVietnamese: boolean;
  onComplete: () => void;
}

export function PracticeMode({ conversation, showVietnamese, onComplete }: PracticeModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const lines = conversation.lines;

  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
    return () => cancelAnimationFrame(id);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < lines.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        
        <h2 className="text-2xl font-serif font-semibold text-foreground mb-2 text-center">
          Practice Complete!
        </h2>
        
        <p className="text-muted-foreground mb-6 text-center">
          You've read through the entire conversation. Ready for the next challenge?
        </p>
        
        <Button onClick={onComplete} className="gap-2">
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Progress bar */}
      <div className="shrink-0 px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>Practice Mode</span>
          <span>{currentIndex + 1} / {lines.length}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-500 ease-out rounded-full"
            style={{ width: `${((currentIndex + 1) / lines.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Chat area - scrolls; fills space between progress and button */}
      <div 
        ref={chatContainerRef}
        className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-hide"
      >
        {lines.slice(0, currentIndex + 1).map((line, index) => (
          <ChatBubble
            key={index}
            line={line}
            showVietnamese={showVietnamese}
            isNew={index === currentIndex}
          />
        ))}
        <div ref={bottomRef} aria-hidden="true" className="h-1 shrink-0" />
      </div>

      {/* Next button - sticky at bottom */}
      <div className="shrink-0 border-t border-border bg-card/80 backdrop-blur-sm p-4">
        <Button onClick={handleNext} className="w-full gap-2">
          {currentIndex < lines.length - 1 ? 'Next Response' : 'Complete'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
