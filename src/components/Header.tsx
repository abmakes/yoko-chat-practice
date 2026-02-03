import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  showVietnamese: boolean;
  onToggleVietnamese: () => void;
  showBack?: boolean;
  onBack?: () => void;
}

export function Header({
  showVietnamese,
  onToggleVietnamese,
  showBack = false,
  onBack,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          {showBack && onBack ? (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="mr-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          ) : null}
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground p-1 font-serif font-bold text-sm">習</span>
            </div>
            <div>
              <h1 className="font-serif font-semibold text-foreground text-sm leading-tight">
                YOKO ONSEN
              </h1>
              <p className="text-[10px] text-muted-foreground leading-tight">
                English Practice
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">VN</span>
            <Switch
              checked={showVietnamese}
              onCheckedChange={onToggleVietnamese}
              className="data-[state=checked]:bg-accent"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
