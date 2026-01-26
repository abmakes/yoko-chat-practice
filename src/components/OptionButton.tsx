import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface OptionButtonProps {
  text: string;
  onClick: () => void;
  state: 'default' | 'correct' | 'incorrect' | 'disabled';
  showVietnamese: boolean;
  vietnamese?: string;
}

export function OptionButton({ text, onClick, state, showVietnamese, vietnamese }: OptionButtonProps) {
  const isDisabled = state === 'disabled' || state === 'correct' || state === 'incorrect';

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'option-button relative animate-slide-up',
        state === 'correct' && 'correct',
        state === 'incorrect' && 'incorrect',
        state === 'disabled' && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-[15px] leading-relaxed">{text}</p>
          {showVietnamese && vietnamese && (
            <p className="vietnamese-text mt-1">{vietnamese}</p>
          )}
        </div>
        
        {state === 'correct' && (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-success flex items-center justify-center">
            <Check className="w-4 h-4 text-success-foreground" />
          </div>
        )}
        
        {state === 'incorrect' && (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive flex items-center justify-center">
            <X className="w-4 h-4 text-destructive-foreground" />
          </div>
        )}
      </div>
    </button>
  );
}
