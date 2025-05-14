
'use client';

import type { Lane } from '@/types';
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
  const headerStyle = lane.color ? { backgroundColor: lane.color } : {};
  const titleStyle = lane.textColor ? lane.textColor : 'text-card-foreground';
  const buttonColorClass = lane.textColor || 'text-primary';


  return (
    <Card
      className="w-full h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)] flex flex-col shrink-0 bg-card shadow-lg rounded-lg"
      onDragOver={onDragOverLane}
      onDrop={(e) => onDropTaskInLane(e, lane.id)}
      aria-labelledby={`lane-title-${lane.id}`}
    >
      <CardHeader 
        className="p-4 border-b border-border"
        style={headerStyle}
      >
        <div className="flex justify-between items-center">
          <CardTitle id={`lane-title-${lane.id}`} className={`text-lg font-semibold ${titleStyle}`}>{lane.title}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenAddTaskDialog(lane.id)}
            aria-label={`Add task to ${lane.title}`}
            className={`hover:opacity-80 ${buttonColorClass}`}
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
                laneColor={lane.color}
                laneTextColor={lane.textColor}
              />
            ))
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
