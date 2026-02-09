import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { parseConversationText, Conversation } from '@/data/conversations';
import { useConversations } from '@/contexts/ConversationsContext';
import { toast } from 'sonner';
import { FileText, Code, ArrowLeft } from 'lucide-react';

const JSON_FORMAT_GUIDE = `Required fields:
• id (string): unique identifier, e.g. "room-service-1"
• title (string): display name, e.g. "Room Service"
• lines (array): each item must have:
  - speaker: "staff" or "guest"
  - english (string): the line in English
  - vietnamese (string, optional): translation

Rules: Use double quotes only. No trailing commas. Valid JSON.`;

const EXAMPLE_JSON = `{
  "id": "room-service-1",
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

export default function AddConversation() {
  const { conversations, addConversation, deleteConversation } = useConversations();
  const [title, setTitle] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [jsonText, setJsonText] = useState('');

  const handlePasteSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    const conversation = parseConversationText(pasteText, title);
    if (conversation) {
      await addConversation(conversation);
      toast.success('Conversation added!');
      setTitle('');
      setPasteText('');
    } else {
      toast.error('Could not parse conversation. Make sure each line starts with "Staff:" or "Guest:"');
    }
  };

  const handleJsonSubmit = async () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.title || !parsed.lines || !Array.isArray(parsed.lines)) {
        throw new Error('Invalid structure');
      }
      const conversation: Conversation = {
        id: parsed.id || `json-${Date.now()}`,
        title: parsed.title,
        description: parsed.description,
        unit: parsed.unit,
        lines: parsed.lines.map((line: { speaker: string; english: string; vietnamese?: string }) => ({
          speaker: line.speaker,
          english: line.english,
          vietnamese: line.vietnamese,
        })),
      };
      await addConversation(conversation);
      toast.success('Conversation added from JSON!');
      setJsonText('');
    } catch {
      toast.error('Invalid JSON format. Please check your input.');
    }
  };

  const handleDeleteConversation = async (id: string, title: string) => {
    const confirmed = window.confirm(`Delete conversation "${title}"? This cannot be undone.`);
    if (!confirmed) return;
    await deleteConversation(id);
    toast.success('Conversation deleted.');
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto flex flex-col p-4">
      <header className="flex items-center gap-2 py-3 border-b border-border">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <h1 className="font-serif font-semibold text-foreground">Add Conversation</h1>
      </header>

      <main className="flex-1 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Existing conversations</CardTitle>
            <CardDescription>
              Manage conversations stored in the database. Deleting a conversation removes it from the list for all students.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No conversations yet.</p>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {conversation.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {conversation.id}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-destructive hover:text-destructive"
                      onClick={() => handleDeleteConversation(conversation.id, conversation.title)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">JSON format guide</CardTitle>
            <CardDescription>
              Use this spec to prompt an LLM to generate a conversation, then paste the JSON below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
              {JSON_FORMAT_GUIDE}
            </pre>
            <p className="text-xs text-muted-foreground mt-2">
              Example (copy-paste to test):
            </p>
            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg mt-1 overflow-x-auto">
              {EXAMPLE_JSON}
            </pre>
          </CardContent>
        </Card>

        <Tabs defaultValue="json" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paste" className="gap-2">
              <FileText className="w-4 h-4" />
              Paste text
            </TabsTrigger>
            <TabsTrigger value="json" className="gap-2">
              <Code className="w-4 h-4" />
              JSON
            </TabsTrigger>
          </TabsList>
          <TabsContent value="paste" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Conversation title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Room Service"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paste">Conversation text</Label>
              <Textarea
                id="paste"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Staff: Good morning!\nGuest: Good morning, how are you?\nStaff: I'm fine, thank you."
                className="min-h-[150px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Each line must start with &quot;Staff:&quot; or &quot;Guest:&quot;
              </p>
            </div>
            <Button onClick={handlePasteSubmit} className="w-full">
              Add conversation
            </Button>
          </TabsContent>
          <TabsContent value="json" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="json">JSON data</Label>
              <Textarea
                id="json"
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder={EXAMPLE_JSON}
                className="min-h-[200px] font-mono text-xs"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setJsonText(EXAMPLE_JSON)}
              className="w-full"
            >
              Load example JSON
            </Button>
            <Button onClick={handleJsonSubmit} className="w-full">
              Add from JSON
            </Button>
          </TabsContent>
        </Tabs>

        <p className="text-sm text-muted-foreground">
          <Link to="/" className="text-primary underline hover:no-underline">
            Back to app
          </Link>
          {' '}
          to see the conversation list. New conversations are saved to the database.
        </p>
      </main>
    </div>
  );
}
