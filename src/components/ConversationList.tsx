import { Conversation } from '@/data/conversations';
import { Card } from '@/components/ui/card';
import { MessageCircle, ChevronRight } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  onSelect: (conversation: Conversation) => void;
}

export function ConversationList({ conversations, onSelect }: ConversationListProps) {
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

      {conversations.map((conversation) => (
        <Card
          key={conversation.id}
          onClick={() => onSelect(conversation)}
          className="p-4 cursor-pointer hover:bg-muted/50 transition-all duration-200 hover:shadow-md active:scale-[0.98] zen-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-accent" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground">
                {conversation.title}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {conversation.lines.length} exchanges
              </p>
            </div>
            
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </div>
        </Card>
      ))}
    </div>
  );
}
