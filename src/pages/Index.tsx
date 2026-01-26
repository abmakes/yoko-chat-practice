import { useState } from 'react';
import { Header } from '@/components/Header';
import { ConversationList } from '@/components/ConversationList';
import { ConversationPractice } from '@/components/ConversationPractice';
import { AddConversationDialog } from '@/components/AddConversationDialog';
import { sampleConversations, Conversation } from '@/data/conversations';

const Index = () => {
  const [showVietnamese, setShowVietnamese] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(sampleConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAddConversation = (conversation: Conversation) => {
    setConversations(prev => [...prev, conversation]);
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto flex flex-col">
      <Header
        showVietnamese={showVietnamese}
        onToggleVietnamese={() => setShowVietnamese(!showVietnamese)}
        showBack={!!selectedConversation}
        onBack={handleBack}
        onAddConversation={() => setShowAddDialog(true)}
      />

      <main className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ConversationPractice
            conversation={selectedConversation}
            showVietnamese={showVietnamese}
            onComplete={handleBack}
            onBack={handleBack}
          />
        ) : (
          <ConversationList
            conversations={conversations}
            onSelect={setSelectedConversation}
          />
        )}
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
