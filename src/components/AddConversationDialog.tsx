import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { parseConversationText, Conversation } from '@/data/conversations';
import { toast } from 'sonner';
import { FileText, Code } from 'lucide-react';

interface AddConversationDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (conversation: Conversation) => void;
}

const exampleJson = `{
  "id": "custom-conversation",
  "title": "Room Service",
  "lines": [
    {
      "speaker": "staff",
      "english": "Good evening, room service.",
      "vietnamese": "Chào buổi tối, dịch vụ phòng."
    },
    {
      "speaker": "guest",
      "english": "Hi, I'd like to order dinner.",
      "vietnamese": "Xin chào, tôi muốn đặt bữa tối."
    }
  ]
}`;

export function AddConversationDialog({ open, onClose, onAdd }: AddConversationDialogProps) {
  const [title, setTitle] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [jsonText, setJsonText] = useState('');

  const handlePasteSubmit = () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    
    const conversation = parseConversationText(pasteText, title);
    if (conversation) {
      onAdd(conversation);
      toast.success('Conversation added!');
      resetAndClose();
    } else {
      toast.error('Could not parse conversation. Make sure each line starts with "Staff:" or "Guest:"');
    }
  };

  const handleJsonSubmit = () => {
    try {
      const parsed = JSON.parse(jsonText);
      
      // Validate structure
      if (!parsed.title || !parsed.lines || !Array.isArray(parsed.lines)) {
        throw new Error('Invalid structure');
      }
      
      const conversation: Conversation = {
        id: parsed.id || `json-${Date.now()}`,
        title: parsed.title,
        lines: parsed.lines.map((line: any) => ({
          speaker: line.speaker,
          english: line.english,
          vietnamese: line.vietnamese
        }))
      };
      
      onAdd(conversation);
      toast.success('Conversation added from JSON!');
      resetAndClose();
    } catch {
      toast.error('Invalid JSON format. Please check your input.');
    }
  };

  const resetAndClose = () => {
    setTitle('');
    setPasteText('');
    setJsonText('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && resetAndClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Add Conversation</DialogTitle>
          <DialogDescription>
            Paste a conversation or provide JSON data
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="paste" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paste" className="gap-2">
              <FileText className="w-4 h-4" />
              Paste Text
            </TabsTrigger>
            <TabsTrigger value="json" className="gap-2">
              <Code className="w-4 h-4" />
              JSON
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="paste" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Conversation Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Room Service"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paste">Conversation Text</Label>
              <Textarea
                id="paste"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={`Staff: Good morning!\nGuest: Good morning, how are you?\nStaff: I'm fine, thank you.`}
                className="min-h-[150px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Each line should start with "Staff:" or "Guest:"
              </p>
            </div>
            
            <Button onClick={handlePasteSubmit} className="w-full">
              Add Conversation
            </Button>
          </TabsContent>
          
          <TabsContent value="json" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="json">JSON Data</Label>
              <Textarea
                id="json"
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder={exampleJson}
                className="min-h-[200px] font-mono text-xs"
              />
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setJsonText(exampleJson)}
              className="w-full"
            >
              Load Example JSON
            </Button>
            
            <Button onClick={handleJsonSubmit} className="w-full">
              Add from JSON
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
