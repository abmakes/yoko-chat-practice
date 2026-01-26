import { ConversationLine } from '@/data/conversations';
import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  line: ConversationLine;
  showVietnamese: boolean;
  isNew?: boolean;
}

export function ChatBubble({ line, showVietnamese, isNew = false }: ChatBubbleProps) {
  const isStaff = line.speaker === 'staff';

  return (
    <div
      className={cn(
        'flex flex-col max-w-[85%] mb-3',
        isStaff ? 'items-start' : 'items-end ml-auto',
        isNew && 'animate-fade-in'
      )}
    >
      <span className={cn(
        'text-xs font-medium mb-1 px-1',
        isStaff ? 'text-accent' : 'text-primary'
      )}>
        {isStaff ? 'Staff' : 'Guest'}
      </span>
      
      <div className={cn(
        'px-4 py-3 shadow-sm',
        isStaff 
          ? 'bg-staff-bubble text-staff-bubble-foreground rounded-2xl rounded-tl-md' 
          : 'bg-guest-bubble text-guest-bubble-foreground rounded-2xl rounded-tr-md'
      )}>
        <p className="text-[15px] leading-relaxed">{line.english}</p>
        
        {showVietnamese && line.vietnamese && (
          <p className="vietnamese-text border-t border-border/30 pt-2 mt-2">
            {line.vietnamese}
          </p>
        )}
      </div>
    </div>
  );
}
