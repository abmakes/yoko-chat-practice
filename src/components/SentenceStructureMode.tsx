import { useState, useEffect, useRef } from 'react';
import { Conversation } from '@/data/conversations';
import { ChatBubble } from './ChatBubble';
import { Button } from '@/components/ui/button';
import { ArrowRight, RotateCcw, Trophy, Check, X } from 'lucide-react';

interface SentenceStructureModeProps {
  conversation: Conversation;
  showVietnamese: boolean;
  onComplete: () => void;
}

interface WordTile {
  id: string;
  word: string;
  isSelected: boolean;
}

export function SentenceStructureMode({ 
  conversation, 
  showVietnamese, 
  onComplete 
}: SentenceStructureModeProps) {
  const [displayedLines, setDisplayedLines] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [wordTiles, setWordTiles] = useState<WordTile[]>([]);
  const [selectedWords, setSelectedWords] = useState<WordTile[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const lines = conversation.lines;

  // Find all guest response indices
  const guestIndices = lines
    .map((line, index) => ({ line, index }))
    .filter(item => item.line.speaker === 'guest')
    .map(item => item.index);

  // Initialize
  useEffect(() => {
    if (guestIndices.length === 0) {
      setIsComplete(true);
      return;
    }

    setTotalQuestions(guestIndices.length);
    
    const firstGuestIndex = guestIndices[0];
    const initialLines = [];
    for (let i = 0; i < firstGuestIndex; i++) {
      initialLines.push(i);
    }
    setDisplayedLines(initialLines);
    setCurrentQuestionIndex(0);
    generateWordTiles(firstGuestIndex);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [displayedLines]);

  const generateWordTiles = (guestIndex: number) => {
    const sentence = lines[guestIndex].english;
    // Split into words, preserving punctuation attached to words
    const words = sentence.split(/\s+/).filter(w => w.length > 0);
    
    const tiles: WordTile[] = words.map((word, index) => ({
      id: `${index}-${word}`,
      word,
      isSelected: false,
    }));

    // Shuffle the tiles
    const shuffled = [...tiles].sort(() => Math.random() - 0.5);
    setWordTiles(shuffled);
    setSelectedWords([]);
    setIsSubmitted(false);
    setIsCorrect(null);
  };

  const handleTileClick = (tile: WordTile) => {
    if (isSubmitted) return;
    
    if (tile.isSelected) {
      // Remove from selected
      setSelectedWords(prev => prev.filter(t => t.id !== tile.id));
      setWordTiles(prev => prev.map(t => 
        t.id === tile.id ? { ...t, isSelected: false } : t
      ));
    } else {
      // Add to selected
      setSelectedWords(prev => [...prev, { ...tile, isSelected: true }]);
      setWordTiles(prev => prev.map(t => 
        t.id === tile.id ? { ...t, isSelected: true } : t
      ));
    }
  };

  const handleSelectedClick = (tile: WordTile) => {
    if (isSubmitted) return;
    
    // Remove from selected and mark as unselected in tiles
    setSelectedWords(prev => prev.filter(t => t.id !== tile.id));
    setWordTiles(prev => prev.map(t => 
      t.id === tile.id ? { ...t, isSelected: false } : t
    ));
  };

  const handleSubmit = () => {
    const guestIndex = guestIndices[currentQuestionIndex];
    const correctSentence = lines[guestIndex].english;
    const userSentence = selectedWords.map(t => t.word).join(' ');
    
    const correct = userSentence === correctSentence;
    setIsCorrect(correct);
    setIsSubmitted(true);
    
    if (correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleContinue = () => {
    const currentGuestIndex = guestIndices[currentQuestionIndex];
    
    // Add guest response to displayed lines
    setDisplayedLines(prev => [...prev, currentGuestIndex]);
    
    const nextQuestionIndex = currentQuestionIndex + 1;
    
    if (nextQuestionIndex >= guestIndices.length) {
      setTimeout(() => setIsComplete(true), 500);
      return;
    }

    const nextGuestIndex = guestIndices[nextQuestionIndex];
    setTimeout(() => {
      const newLines = [];
      for (let i = currentGuestIndex + 1; i < nextGuestIndex; i++) {
        newLines.push(i);
      }
      setDisplayedLines(prev => [...prev, ...newLines]);
      setCurrentQuestionIndex(nextQuestionIndex);
      
      setTimeout(() => {
        generateWordTiles(nextGuestIndex);
      }, 300);
    }, 300);
  };

  const handleRestart = () => {
    setDisplayedLines([]);
    setWordTiles([]);
    setSelectedWords([]);
    setIsSubmitted(false);
    setIsCorrect(null);
    setScore(0);
    setIsComplete(false);
    setCurrentQuestionIndex(-1);
    
    setTimeout(() => {
      const firstGuestIndex = guestIndices[0];
      const initialLines = [];
      for (let i = 0; i < firstGuestIndex; i++) {
        initialLines.push(i);
      }
      setDisplayedLines(initialLines);
      setCurrentQuestionIndex(0);
      generateWordTiles(firstGuestIndex);
    }, 100);
  };

  const scorePercentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-6">
          <Trophy className="w-10 h-10 text-success" />
        </div>
        
        <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
          Congratulations!
        </h2>
        
        <p className="text-muted-foreground mb-6">
          You scored {score} out of {totalQuestions} ({scorePercentage}%)
        </p>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRestart} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
          <Button onClick={onComplete} className="gap-2">
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  const currentGuestLine = currentQuestionIndex >= 0 ? lines[guestIndices[currentQuestionIndex]] : null;

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>Sentence Structure</span>
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

      {/* Word tiles area */}
      {wordTiles.length > 0 && (
        <div className="border-t border-border bg-card/80 backdrop-blur-sm p-4 space-y-4 animate-slide-up">
          <p className="text-sm text-muted-foreground text-center">
            Arrange the words to form the correct response
          </p>

          {/* Vietnamese hint */}
          {showVietnamese && currentGuestLine?.vietnamese && (
            <p className="text-sm text-center text-muted-foreground italic">
              {currentGuestLine.vietnamese}
            </p>
          )}

          {/* Selected words area */}
          <div className={`min-h-[60px] p-3 rounded-lg border-2 border-dashed ${
            isSubmitted 
              ? isCorrect 
                ? 'border-success bg-success/10' 
                : 'border-destructive bg-destructive/10'
              : 'border-muted-foreground/30 bg-muted/30'
          }`}>
            <div className="flex flex-wrap gap-2">
              {selectedWords.map((tile) => (
                <button
                  key={tile.id}
                  onClick={() => handleSelectedClick(tile)}
                  disabled={isSubmitted}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isSubmitted
                      ? isCorrect
                        ? 'bg-success text-success-foreground'
                        : 'bg-destructive text-destructive-foreground'
                      : 'bg-accent text-accent-foreground hover:bg-accent/80 active:scale-95'
                  }`}
                >
                  {tile.word}
                </button>
              ))}
              {selectedWords.length === 0 && (
                <span className="text-muted-foreground text-sm">
                  Tap words below to build your response
                </span>
              )}
            </div>
          </div>

          {/* Feedback */}
          {isSubmitted && (
            <div className={`flex items-center justify-center gap-2 text-sm ${
              isCorrect ? 'text-success' : 'text-destructive'
            }`}>
              {isCorrect ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Correct!</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4" />
                  <span>Correct answer: {lines[guestIndices[currentQuestionIndex]].english}</span>
                </>
              )}
            </div>
          )}

          {/* Available word tiles */}
          {!isSubmitted && (
            <div className="flex flex-wrap gap-2 justify-center">
              {wordTiles.map((tile) => (
                <button
                  key={tile.id}
                  onClick={() => handleTileClick(tile)}
                  disabled={tile.isSelected}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    tile.isSelected
                      ? 'bg-muted text-muted-foreground opacity-50'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95'
                  }`}
                >
                  {tile.word}
                </button>
              ))}
            </div>
          )}

          {/* Action button */}
          {!isSubmitted ? (
            <Button 
              onClick={handleSubmit} 
              className="w-full gap-2"
              disabled={selectedWords.length === 0}
            >
              Check Answer
              <Check className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleContinue} 
              className="w-full gap-2"
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
