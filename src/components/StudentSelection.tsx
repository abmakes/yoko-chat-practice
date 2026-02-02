import { useState } from 'react';
import { groups, getStudentKey, type Group } from '@/data/groups';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, ChevronRight } from 'lucide-react';

interface StudentSelectionProps {
  onComplete: (studentKey: string, groupId: string, studentName: string) => void;
}

export function StudentSelection({ onComplete }: StudentSelectionProps) {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedName, setSelectedName] = useState<string>('');

  const handleConfirm = () => {
    if (!selectedGroup || !selectedName.trim()) return;
    const studentKey = getStudentKey(selectedGroup.id, selectedName);
    onComplete(studentKey, selectedGroup.id, selectedName);
  };

  if (!selectedGroup) {
    return (
      <div className="min-h-screen bg-background max-w-lg mx-auto flex flex-col p-4">
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h1 className="text-xl font-serif font-semibold text-foreground mb-1">
              Select your group
            </h1>
            <p className="text-sm text-muted-foreground">
              Choose the group you belong to
            </p>
          </div>
          <div className="space-y-3">
            {groups.map((group) => (
              <Card
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className="p-5 cursor-pointer hover:bg-muted/50 transition-all duration-200 hover:shadow-md active:scale-[0.98] flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-medium text-foreground">{group.label}</h2>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto flex flex-col p-4">
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          <h1 className="text-xl font-serif font-semibold text-foreground mb-1">
            Select your name
          </h1>
          <p className="text-sm text-muted-foreground">
            {selectedGroup.label}
          </p>
        </div>
        <div className="space-y-4">
          <Select value={selectedName} onValueChange={setSelectedName}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose your name..." />
            </SelectTrigger>
            <SelectContent>
              {selectedGroup.studentNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleConfirm}
            disabled={!selectedName.trim()}
            className="w-full gap-2"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedGroup(null);
              setSelectedName('');
            }}
            className="w-full text-muted-foreground"
          >
            Back to groups
          </Button>
        </div>
      </div>
    </div>
  );
}
