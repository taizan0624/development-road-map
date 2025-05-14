'use client';

import type { Lane, Task } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TaskCard } from './TaskCard';
import { PlusCircle } from 'lucide-react';

interface SwimlaneProps {
  lane: Lane;
  onDragStartTask: (event: React.DragEvent<HTMLDivElement>, taskId: string, laneId: string) => void;
  onDragOverLane: (event: React.DragEvent<HTMLDivElement>) => void;
  onDropTaskInLane: (event: React.DragEvent<HTMLDivElement>, targetLaneId: string) => void;
  onOpenAddTaskDialog: (laneId: string) => void;
}

export function Swimlane({
  lane,
  onDragStartTask,
  onDragOverLane,
  onDropTaskInLane,
  onOpenAddTaskDialog,
}: SwimlaneProps) {
  return (
    <Card
      className="w-[300px] md:w-[350px] h-[calc(100vh-10rem)] flex flex-col shrink-0 bg-card shadow-lg rounded-lg"
      onDragOver={onDragOverLane}
      onDrop={(e) => onDropTaskInLane(e, lane.id)}
      aria-labelledby={`lane-title-${lane.id}`}
    >
      <CardHeader className="p-4 border-b border-border">
        <div className="flex justify-between items-center">
          <CardTitle id={`lane-title-${lane.id}`} className="text-lg font-semibold text-card-foreground">{lane.title}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenAddTaskDialog(lane.id)}
            aria-label={`Add task to ${lane.title}`}
            className="text-primary hover:text-primary/80"
          >
            <PlusCircle className="h-6 w-6" />
          </Button>
        </div>
      </CardHeader>
      <ScrollArea className="flex-grow">
        <CardContent className="p-4">
          {lane.tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No tasks yet.</p>
          ) : (
            lane.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                laneId={lane.id}
                onDragStart={onDragStartTask}
              />
            ))
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
