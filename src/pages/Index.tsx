import { useState } from 'react';
import { Header } from '@/components/Header';
import { ConversationList } from '@/components/ConversationList';
import { ModeSelection } from '@/components/ModeSelection';
import { PracticeMode } from '@/components/PracticeMode';
import { SelectResponsesMode } from '@/components/SelectResponsesMode';
import { SentenceStructureMode } from '@/components/SentenceStructureMode';
import { AddConversationDialog } from '@/components/AddConversationDialog';
import { sampleConversations, Conversation } from '@/data/conversations';
import { LearningMode, useConversationProgress } from '@/hooks/useConversationProgress';

type ViewState = 
  | { type: 'list' }
  | { type: 'modeSelection'; conversation: Conversation }
  | { type: 'learning'; conversation: Conversation; mode: LearningMode };

const Index = () => {
  const [showVietnamese, setShowVietnamese] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(sampleConversations);
  const [viewState, setViewState] = useState<ViewState>({ type: 'list' });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { completeMode, getOverallProgress, getProgress, isModeUnlocked } = useConversationProgress();

  const handleAddConversation = (conversation: Conversation) => {
    setConversations(prev => [...prev, conversation]);
  };

  const handleBack = () => {
    if (viewState.type === 'learning') {
      setViewState({ type: 'modeSelection', conversation: viewState.conversation });
    } else {
      setViewState({ type: 'list' });
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setViewState({ type: 'modeSelection', conversation });
  };

  const handleSelectMode = (mode: LearningMode) => {
    if (viewState.type === 'modeSelection') {
      setViewState({ type: 'learning', conversation: viewState.conversation, mode });
    }
  };

  const handlePracticeComplete = () => {
    if (viewState.type === 'learning') {
      completeMode(viewState.conversation.id, 'practice');
      setViewState({ type: 'modeSelection', conversation: viewState.conversation });
    }
  };

  const handleSelectComplete = (scorePercentage: number) => {
    if (viewState.type === 'learning') {
      completeMode(viewState.conversation.id, 'select', scorePercentage);
      setViewState({ type: 'modeSelection', conversation: viewState.conversation });
    }
  };

  const handleStructureComplete = () => {
    if (viewState.type === 'learning') {
      completeMode(viewState.conversation.id, 'structure');
      setViewState({ type: 'modeSelection', conversation: viewState.conversation });
    }
  };

  const renderContent = () => {
    switch (viewState.type) {
      case 'list':
        return (
          <ConversationList
            conversations={conversations}
            onSelect={handleSelectConversation}
            getOverallProgress={getOverallProgress}
          />
        );
      case 'modeSelection':
        return (
          <ModeSelection
            conversation={viewState.conversation}
            onSelectMode={handleSelectMode}
            progress={getProgress(viewState.conversation.id)}
            isModeUnlocked={isModeUnlocked}
          />
        );
      case 'learning':
        switch (viewState.mode) {
          case 'practice':
            return (
              <PracticeMode
                conversation={viewState.conversation}
                showVietnamese={showVietnamese}
                onComplete={handlePracticeComplete}
              />
            );
          case 'select':
            return (
              <SelectResponsesMode
                conversation={viewState.conversation}
                showVietnamese={showVietnamese}
                onComplete={handleSelectComplete}
              />
            );
          case 'structure':
            return (
              <SentenceStructureMode
                conversation={viewState.conversation}
                showVietnamese={showVietnamese}
                onComplete={handleStructureComplete}
              />
            );
        }
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto flex flex-col">
      <Header
        showVietnamese={showVietnamese}
        onToggleVietnamese={() => setShowVietnamese(!showVietnamese)}
        showBack={viewState.type !== 'list'}
        onBack={handleBack}
        onAddConversation={() => setShowAddDialog(true)}
      />

      <main className="flex-1 flex flex-col">
        {renderContent()}
      </main>

      <AddConversationDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddConversation}
      />
    </div>
  );
};

export default Index;
