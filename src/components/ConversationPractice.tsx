import { useState, useEffect, useRef } from 'react';
import { Conversation, generateWrongOptions } from '@/data/conversations';
import { ChatBubble } from './ChatBubble';
import { OptionButton } from './OptionButton';
import { Button } from '@/components/ui/button';
import { ArrowRight, RotateCcw, Trophy } from 'lucide-react';

interface ConversationPracticeProps {
  conversation: Conversation;
  showVietnamese: boolean;
  onComplete: () => void;
  onBack: () => void;
}

interface Option {
  text: string;
  vietnamese?: string;
  isCorrect: boolean;
}

export function ConversationPractice({ 
  conversation, 
  showVietnamese, 
  onComplete,
  onBack 
}: ConversationPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedLines, setDisplayedLines] = useState<number[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const lines = conversation.lines;

  // Initialize or move to next line
  useEffect(() => {
    if (currentIndex >= lines.length) {
      setIsComplete(true);
      return;
    }

    const currentLine = lines[currentIndex];
    
    // If it's the first line or a staff line, display it automatically
    if (currentIndex === 0 || currentLine.speaker === 'staff') {
      setDisplayedLines(prev => [...prev, currentIndex]);
      
      // Check if next line exists and is a guest response (needs selection)
      const nextIndex = currentIndex + 1;
      if (nextIndex < lines.length && lines[nextIndex].speaker === 'guest') {
        // Generate options for the guest response
        setTimeout(() => {
          const correctLine = lines[nextIndex];
          const wrongOptions = generateWrongOptions(
            correctLine.english,
            lines,
            'staff'
          );
          
          const allOptions: Option[] = [
            { text: correctLine.english, vietnamese: correctLine.vietnamese, isCorrect: true },
            ...wrongOptions.map(text => {
              const matchingLine = lines.find(l => l.english === text);
              return { 
                text, 
                vietnamese: matchingLine?.vietnamese,
                isCorrect: false 
              };
            })
          ].sort(() => Math.random() - 0.5);
          
          setOptions(allOptions);
          setSelectedOption(null);
          setIsCorrect(null);
        }, 500);
      } else if (nextIndex < lines.length) {
        // Next is also staff, auto-advance
        setTimeout(() => setCurrentIndex(nextIndex), 800);
      } else {
        // End of conversation
        setTimeout(() => setIsComplete(true), 800);
      }
    }
  }, [currentIndex, lines]);

  // Scroll to bottom when new messages appear
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [displayedLines, options]);

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(index);
    const selected = options[index];
    setIsCorrect(selected.isCorrect);
    
    if (selected.isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleContinue = () => {
    // Add the guest response to displayed lines
    const nextIndex = currentIndex + 1;
    setDisplayedLines(prev => [...prev, nextIndex]);
    setOptions([]);
    
    // Move to the line after the guest response
    setTimeout(() => setCurrentIndex(nextIndex + 1), 300);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setDisplayedLines([]);
    setOptions([]);
    setSelectedOption(null);
    setIsCorrect(null);
    setScore(0);
    setIsComplete(false);
  };

  const totalQuestions = lines.filter((_, i) => 
    i > 0 && lines[i].speaker === 'guest' && lines[i-1]?.speaker === 'staff'
  ).length;

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-6">
          <Trophy className="w-10 h-10 text-success" />
        </div>
        
        <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
          Conversation Complete!
        </h2>
        
        <p className="text-muted-foreground mb-6">
          You scored {score} out of {totalQuestions}
        </p>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRestart} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
          <Button onClick={onBack} className="gap-2">
            More Conversations
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>{conversation.title}</span>
          <span>{Math.round((displayedLines.length / lines.length) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-500 ease-out rounded-full"
            style={{ width: `${(displayedLines.length / lines.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Chat area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 scrollbar-hide"
      >
        {displayedLines.map((lineIndex) => (
          <ChatBubble
            key={lineIndex}
            line={lines[lineIndex]}
            showVietnamese={showVietnamese}
            isNew={lineIndex === displayedLines[displayedLines.length - 1]}
          />
        ))}
      </div>

      {/* Options area */}
      {options.length > 0 && (
        <div className="border-t border-border bg-card/80 backdrop-blur-sm p-4 space-y-3 animate-slide-up">
          <p className="text-sm text-muted-foreground text-center mb-3">
            How should the guest respond?
          </p>
          
          {options.map((option, index) => (
            <OptionButton
              key={index}
              text={option.text}
              vietnamese={option.vietnamese}
              showVietnamese={showVietnamese}
              onClick={() => handleOptionSelect(index)}
              state={
                selectedOption === null 
                  ? 'default' 
                  : index === selectedOption
                    ? isCorrect ? 'correct' : 'incorrect'
                    : option.isCorrect && selectedOption !== null
                      ? 'correct'
                      : 'disabled'
              }
            />
          ))}
          
          {selectedOption !== null && (
            <Button 
              onClick={handleContinue} 
              className="w-full mt-4 gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
