import { Conversation } from '@/data/conversations';
import { Card } from '@/components/ui/card';
import { MessageCircle, ChevronRight } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  onSelect: (conversation: Conversation) => void;
  getOverallProgress: (conversationId: string) => number;
}

export function ConversationList({ conversations, onSelect, getOverallProgress }: ConversationListProps) {
  const getProgressBorderClass = (progress: number): string => {
    switch (progress) {
      case 1:
        return 'border-l-4 border-l-accent';
      case 2:
        return 'border-l-4 border-l-warning';
      case 3:
        return 'border-l-4 border-l-success';
      default:
        return '';
    }
  };

  const getProgressLabel = (progress: number): string | null => {
    switch (progress) {
      case 1:
        return '1/3';
      case 2:
        return '2/3';
      case 3:
        return 'Complete';
      default:
        return null;
    }
  };

  return (
    <div className="p-4 space-y-3">
      <div className="text-center mb-6">
        <h2 className="text-xl font-serif font-semibold text-foreground mb-1">
          Select a Conversation
        </h2>
        <p className="text-sm text-muted-foreground">
          Practice responding to guests at the resort
        </p>
      </div>

      {conversations.map((conversation) => {
        const progress = getOverallProgress(conversation.id);
        const progressLabel = getProgressLabel(progress);
        
        return (
          <Card
            key={conversation.id}
            onClick={() => onSelect(conversation)}
            className={`p-4 cursor-pointer hover:bg-muted/50 transition-all duration-200 hover:shadow-md active:scale-[0.98] zen-shadow ${getProgressBorderClass(progress)}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                progress === 3 ? 'bg-success/20' : 'bg-secondary'
              }`}>
                <MessageCircle className={`w-6 h-6 ${progress === 3 ? 'text-success' : 'text-accent'}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground">
                  {conversation.title}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.lines.length} exchanges
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {progressLabel && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    progress === 3 
                      ? 'bg-success/20 text-success' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {progressLabel}
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
