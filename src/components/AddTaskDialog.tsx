'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask: (taskContent: string) => void;
  laneTitle: string;
}

export function AddTaskDialog({ open, onOpenChange, onAddTask, laneTitle }: AddTaskDialogProps) {
  const [taskContent, setTaskContent] = useState('');

  const handleSubmit = () => {
    if (taskContent.trim()) {
      onAddTask(taskContent.trim());
      setTaskContent('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>Add Task to {laneTitle}</DialogTitle>
          <DialogDescription>Enter the details for the new task.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-content" className="text-right text-card-foreground">
              Task
            </Label>
            <Input
              id="task-content"
              value={taskContent}
              onChange={(e) => setTaskContent(e.target.value)}
              className="col-span-3 bg-background text-foreground"
              placeholder="Describe the task"
              aria-label="Task description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} className="bg-primary hover:bg-primary/90">Add Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
