'use client';

import type { Task } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { GripVertical } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  laneId: string;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, taskId: string, laneId: string) => void;
}

export function TaskCard({ task, laneId, onDragStart }: TaskCardProps) {
  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, task.id, laneId)}
      className="mb-2 cursor-grab bg-card hover:shadow-md transition-shadow duration-200 active:cursor-grabbing"
      aria-label={`Task: ${task.content}`}
    >
      <CardContent className="p-3 flex items-center justify-between">
        <span className="text-sm text-card-foreground break-words w-full">{task.content}</span>
        <GripVertical className="h-5 w-5 text-muted-foreground ml-2 shrink-0" aria-hidden="true" />
      </CardContent>
    </Card>
  );
}
