
'use client';

import type { Task } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { GripVertical } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  laneId: string;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, taskId: string, laneId: string) => void;
  laneColor?: string;
  laneTextColor?: string;
}

export function TaskCard({ task, laneId, onDragStart, laneColor, laneTextColor }: TaskCardProps) {
  const cardStyle = laneColor ? { backgroundColor: laneColor } : {};
  const textClass = laneTextColor || 'text-card-foreground';
  const iconClass = laneTextColor || 'text-muted-foreground';

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, task.id, laneId)}
      className="mb-2 cursor-grab hover:shadow-md transition-shadow duration-200 active:cursor-grabbing"
      style={cardStyle}
      aria-label={`Task: ${task.content}`}
    >
      <CardContent className="p-3 flex items-center justify-between">
        <span className={`text-sm break-words w-full ${textClass}`}>{task.content}</span>
        <GripVertical className={`h-5 w-5 ml-2 shrink-0 ${iconClass}`} aria-hidden="true" />
      </CardContent>
    </Card>
  );
}
