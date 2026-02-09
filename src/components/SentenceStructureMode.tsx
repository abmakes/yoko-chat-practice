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

const MAX_TILES = 12;

/**
 * Returns at most MAX_TILES chunks. Starts with single words, then
 * repeatedly merges neighbouring tiles until the number of tiles
 * is ≤ MAX_TILES. This naturally creates some 2-word and, for very
 * long sentences, some 3-word tiles, which keeps the activity
 * manageable for lower-level students.
 */
function getChunksForSentence(sentence: string): string[] {
  const words = sentence.split(/\s+/).filter((w) => w.length > 0);
  if (words.length <= MAX_TILES) return words;

  const tiles = [...words]; // start with one word per tile

  // Merge adjacent tiles from left to right until we've reduced
  // the total number of tiles to MAX_TILES.
  let i = 0;
  while (tiles.length > MAX_TILES && tiles.length > 1) {
    if (i >= tiles.length - 1) {
      i = 0;
    }
    tiles[i] = `${tiles[i]} ${tiles[i + 1]}`;
    tiles.splice(i + 1, 1);
    i += 1;
  }

  return tiles;
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
  const bottomRef = useRef<HTMLDivElement>(null);

  const lines = conversation.lines;

  // Find all staff response indices (sentence structure = practice staff lines)
  const staffIndices = lines
    .map((line, index) => ({ line, index }))
    .filter(item => item.line.speaker === 'staff')
    .map(item => item.index);

  // Initialize
  useEffect(() => {
    if (staffIndices.length === 0) {
      setIsComplete(true);
      return;
    }

    setTotalQuestions(staffIndices.length);
    
    const firstStaffIndex = staffIndices[0];
    const initialLines = [];
    for (let i = 0; i < firstStaffIndex; i++) {
      initialLines.push(i);
    }
    setDisplayedLines(initialLines);
    setCurrentQuestionIndex(0);
    generateWordTiles(firstStaffIndex);
  }, []);

  // Auto-scroll so new message is visible
  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
    return () => cancelAnimationFrame(id);
  }, [displayedLines]);

  const generateWordTiles = (staffIndex: number) => {
    const sentence = lines[staffIndex].english;
    const chunks = getChunksForSentence(sentence);

    const tiles: WordTile[] = chunks.map((chunk, index) => ({
      id: `${index}-${chunk}`,
      word: chunk,
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
    const staffIndex = staffIndices[currentQuestionIndex];
    const correctSentence = lines[staffIndex].english;
    const userSentence = selectedWords.map(t => t.word).join(' ');
    
    const correct = userSentence === correctSentence;
    setIsCorrect(correct);
    setIsSubmitted(true);
    
    if (correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleContinue = () => {
    const currentStaffIndex = staffIndices[currentQuestionIndex];
    
    // Add staff response to displayed lines
    setDisplayedLines(prev => [...prev, currentStaffIndex]);
    
    const nextQuestionIndex = currentQuestionIndex + 1;
    
    if (nextQuestionIndex >= staffIndices.length) {
      setTimeout(() => setIsComplete(true), 500);
      return;
    }

    const nextStaffIndex = staffIndices[nextQuestionIndex];
    setTimeout(() => {
      const newLines = [];
      for (let i = currentStaffIndex + 1; i < nextStaffIndex; i++) {
        newLines.push(i);
      }
      setDisplayedLines(prev => [...prev, ...newLines]);
      setCurrentQuestionIndex(nextQuestionIndex);
      
      setTimeout(() => {
        generateWordTiles(nextStaffIndex);
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
      const firstStaffIndex = staffIndices[0];
      const initialLines = [];
      for (let i = 0; i < firstStaffIndex; i++) {
        initialLines.push(i);
      }
      setDisplayedLines(initialLines);
      setCurrentQuestionIndex(0);
      generateWordTiles(firstStaffIndex);
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

  const currentStaffLine = currentQuestionIndex >= 0 ? lines[staffIndices[currentQuestionIndex]] : null;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Progress bar */}
      <div className="shrink-0 px-4 py-2 bg-card border-b border-border">
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

      {/* Chat area - scrolls; fills space between progress and tiles */}
      <div 
        ref={chatContainerRef}
        className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-hide"
      >
        {displayedLines.map((lineIndex) => (
          <ChatBubble
            key={lineIndex}
            line={lines[lineIndex]}
            showVietnamese={showVietnamese}
            isNew={lineIndex === displayedLines[displayedLines.length - 1]}
          />
        ))}
        <div ref={bottomRef} aria-hidden="true" className="h-1 shrink-0" />
      </div>

      {/* Word tiles area - sticky at bottom */}
      {wordTiles.length > 0 && (
        <div className="shrink-0 border-t border-border bg-card/80 backdrop-blur-sm p-4 space-y-4 animate-slide-up">
          <p className="text-sm text-muted-foreground text-center">
            Arrange the words to form your (staff) response
          </p>

          {/* Vietnamese hint */}
          {showVietnamese && currentStaffLine?.vietnamese && (
            <p className="text-sm text-center text-muted-foreground italic">
              {currentStaffLine.vietnamese}
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
                  Tap words below to build the staff response
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
                  <span>Correct answer: {lines[staffIndices[currentQuestionIndex]].english}</span>
                </>
              )}
            </div>
          )}

          {/* Available word tiles (unselected only) */}
          {!isSubmitted && (
            <div className="flex flex-wrap gap-2 justify-center">
              {wordTiles.filter((tile) => !tile.isSelected).map((tile) => (
                <button
                  key={tile.id}
                  onClick={() => handleTileClick(tile)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95"
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
