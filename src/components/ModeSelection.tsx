import { Conversation } from '@/data/conversations';
import { LearningMode, useConversationProgress } from '@/hooks/useConversationProgress';
import { Card } from '@/components/ui/card';
import { BookOpen, MessageSquare, Puzzle, Lock, CheckCircle2 } from 'lucide-react';

interface ModeSelectionProps {
  conversation: Conversation;
  onSelectMode: (mode: LearningMode) => void;
}

interface ModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isLocked: boolean;
  isCompleted: boolean;
  bestScore?: number;
  onClick: () => void;
}

function ModeCard({ title, description, icon, isLocked, isCompleted, bestScore, onClick }: ModeCardProps) {
  return (
    <Card
      onClick={isLocked ? undefined : onClick}
      className={`p-5 transition-all duration-200 ${
        isLocked 
          ? 'opacity-50 cursor-not-allowed bg-muted/30' 
          : 'cursor-pointer hover:bg-muted/50 hover:shadow-md active:scale-[0.98]'
      } ${isCompleted ? 'border-success/50' : ''}`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
          isLocked ? 'bg-muted' : isCompleted ? 'bg-success/20' : 'bg-secondary'
        }`}>
          {isLocked ? (
            <Lock className="w-5 h-5 text-muted-foreground" />
          ) : isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-success" />
          ) : (
            icon
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-medium ${isLocked ? 'text-muted-foreground' : 'text-foreground'}`}>
              {title}
            </h3>
            {bestScore !== undefined && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                Best: {bestScore}%
              </span>
            )}
          </div>
          <p className={`text-sm mt-1 ${isLocked ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
            {isLocked ? 'Complete previous mode to unlock' : description}
          </p>
        </div>
      </div>
    </Card>
  );
}

export function ModeSelection({ conversation, onSelectMode }: ModeSelectionProps) {
  const { isModeUnlocked, getProgress } = useConversationProgress();
  const progress = getProgress(conversation.id);

  const modes: { mode: LearningMode; title: string; description: string; icon: React.ReactNode }[] = [
    {
      mode: 'practice',
      title: 'Practice Conversation',
      description: 'Read through the conversation line by line to familiarize yourself',
      icon: <BookOpen className="w-6 h-6 text-accent" />,
    },
    {
      mode: 'select',
      title: 'Select Responses',
      description: 'Choose the correct guest response for each staff question',
      icon: <MessageSquare className="w-6 h-6 text-accent" />,
    },
    {
      mode: 'structure',
      title: 'Sentence Structure',
      description: 'Arrange words in the correct order to form responses',
      icon: <Puzzle className="w-6 h-6 text-accent" />,
    },
  ];

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-xl font-serif font-semibold text-foreground mb-1">
          {conversation.title}
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose a learning mode
        </p>
      </div>

      <div className="space-y-3">
        {modes.map(({ mode, title, description, icon }) => (
          <ModeCard
            key={mode}
            title={title}
            description={description}
            icon={icon}
            isLocked={!isModeUnlocked(conversation.id, mode)}
            isCompleted={progress[mode].completed}
            bestScore={mode === 'select' ? progress.select.bestScore : undefined}
            onClick={() => onSelectMode(mode)}
          />
        ))}
      </div>
    </div>
  );
}
