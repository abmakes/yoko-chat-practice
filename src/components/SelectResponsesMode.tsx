import { useState, useEffect, useRef } from 'react';
import { Conversation, generateWrongOptions } from '@/data/conversations';
import { ChatBubble } from './ChatBubble';
import { OptionButton } from './OptionButton';
import { Button } from '@/components/ui/button';
import { ArrowRight, RotateCcw, Trophy } from 'lucide-react';

interface SelectResponsesModeProps {
  conversation: Conversation;
  showVietnamese: boolean;
  onComplete: (scorePercentage: number) => void;
}

interface Option {
  text: string;
  vietnamese?: string;
  isCorrect: boolean;
}

export function SelectResponsesMode({ 
  conversation, 
  showVietnamese, 
  onComplete 
}: SelectResponsesModeProps) {
  const [displayedLines, setDisplayedLines] = useState<number[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const lines = conversation.lines;

  // Find all staff response indices (these are the questions - students ARE staff)
  const staffIndices = lines
    .map((line, index) => ({ line, index }))
    .filter(item => item.line.speaker === 'staff')
    .map(item => item.index);

  // Initialize - if staff speaks first, show options immediately; otherwise show guest lines first
  useEffect(() => {
    if (staffIndices.length === 0) {
      setIsComplete(true);
      return;
    }

    setTotalQuestions(staffIndices.length);
    
    const firstStaffIndex = staffIndices[0];
    
    // Display all guest lines before the first staff response
    const initialLines = [];
    for (let i = 0; i < firstStaffIndex; i++) {
      initialLines.push(i);
    }
    setDisplayedLines(initialLines);
    setCurrentQuestionIndex(0);
    generateOptions(firstStaffIndex);
  }, []);

  // Scroll to bottom when new messages appear
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [displayedLines, options]);

  const generateOptions = (staffIndex: number) => {
    const correctLine = lines[staffIndex];
    const wrongOptions = generateWrongOptions(
      correctLine.english,
      lines,
      'guest' // Get wrong options from guest lines to create plausible distractors
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
  };

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
    const currentStaffIndex = staffIndices[currentQuestionIndex];
    
    // Add staff response to displayed lines
    setDisplayedLines(prev => [...prev, currentStaffIndex]);
    
    // Check if there are more questions
    const nextQuestionIndex = currentQuestionIndex + 1;
    
    if (nextQuestionIndex >= staffIndices.length) {
      // No more questions - add any remaining lines and complete
      const remainingLines = [];
      for (let i = currentStaffIndex + 1; i < lines.length; i++) {
        remainingLines.push(i);
      }
      if (remainingLines.length > 0) {
        setDisplayedLines(prev => [...prev, ...remainingLines]);
      }
      setTimeout(() => setIsComplete(true), 500);
      return;
    }

    // Add all guest lines between current staff and next staff response
    const nextStaffIndex = staffIndices[nextQuestionIndex];
    setTimeout(() => {
      const newLines = [];
      for (let i = currentStaffIndex + 1; i < nextStaffIndex; i++) {
        newLines.push(i);
      }
      setDisplayedLines(prev => [...prev, ...newLines]);
      setCurrentQuestionIndex(nextQuestionIndex);
      
      setTimeout(() => {
        generateOptions(nextStaffIndex);
      }, 300);
    }, 300);
  };

  const handleRestart = () => {
    setDisplayedLines([]);
    setOptions([]);
    setSelectedOption(null);
    setIsCorrect(null);
    setScore(0);
    setIsComplete(false);
    setCurrentQuestionIndex(-1);
    
    // Re-initialize
    setTimeout(() => {
      const firstStaffIndex = staffIndices[0];
      const initialLines = [];
      for (let i = 0; i < firstStaffIndex; i++) {
        initialLines.push(i);
      }
      setDisplayedLines(initialLines);
      setCurrentQuestionIndex(0);
      generateOptions(firstStaffIndex);
    }, 100);
  };

  const scorePercentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-fade-in">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
          scorePercentage === 100 ? 'bg-success/20' : 'bg-accent/20'
        }`}>
          <Trophy className={`w-10 h-10 ${scorePercentage === 100 ? 'text-success' : 'text-accent'}`} />
        </div>
        
        <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
          {scorePercentage === 100 ? 'Perfect Score!' : 'Good Effort!'}
        </h2>
        
        <p className="text-muted-foreground mb-2">
          You scored {score} out of {totalQuestions} ({scorePercentage}%)
        </p>
        
        {scorePercentage < 100 && (
          <p className="text-sm text-muted-foreground mb-6">
            Get 100% to unlock Sentence Structure mode
          </p>
        )}
        
        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={handleRestart} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
          <Button onClick={() => onComplete(scorePercentage)} className="gap-2">
            Continue
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
          <span>Select Responses</span>
          <span>{currentQuestionIndex + 1} / {totalQuestions}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-500 ease-out rounded-full"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
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
            How should you (staff) respond?
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
