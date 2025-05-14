'use client';

import { useState, useEffect } from 'react';
import type { Lane, Task } from '@/types';
import { Swimlane } from '@/components/Swimlane';
import { AddTaskDialog } from '@/components/AddTaskDialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { suggestTask, type SuggestTaskInput, type SuggestTaskOutput } from '@/ai/flows/suggest-task';
import { Lightbulb, Loader2 } from 'lucide-react';

const initialLanesData: Lane[] = [
  { 
    id: 'todo', 
    title: 'To Do', 
    tasks: [
      { id: 'task-1', content: 'Define project scope and requirements' },
      { id: 'task-2', content: 'Set up development environment' },
      { id: 'task-3', content: 'Design initial UI mockups for key screens' }
    ] 
  },
  { 
    id: 'inprogress', 
    title: 'In Progress', 
    tasks: [
      { id: 'task-4', content: 'Implement core swimlane display logic' },
      { id: 'task-5', content: 'Develop drag and drop functionality for tasks' }
    ] 
  },
  { 
    id: 'done', 
    title: 'Done', 
    tasks: [
      { id: 'task-6', content: 'Integrate Shadcn UI components' },
      { id: 'task-7', content: 'Setup basic Next.js project structure' }
    ] 
  },
];

export default function RoadmapperPage() {
  const [lanes, setLanes] = useState<Lane[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [draggedTaskInfo, setDraggedTaskInfo] = useState<{ taskId: string; sourceLaneId: string } | null>(null);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [currentLaneIdForAddingTask, setCurrentLaneIdForAddingTask] = useState<string | null>(null);
  const [isSuggestingTask, setIsSuggestingTask] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    // Load initial data or from localStorage if implemented
    setLanes(initialLanesData);
  }, []);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, taskId: string, sourceLaneId: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData('taskId', taskId);
    event.dataTransfer.setData('sourceLaneId', sourceLaneId);
    setDraggedTaskInfo({ taskId, sourceLaneId });
    // Optional: add a class to the body or dragged element for styling
    event.currentTarget.classList.add('opacity-50');
  };
  
  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove('opacity-50');
    setDraggedTaskInfo(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Necessary to allow dropping
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, targetLaneId: string) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('taskId');
    const sourceLaneId = event.dataTransfer.getData('sourceLaneId');

    if (!taskId || !sourceLaneId) return;

    // Prevent dropping on elements that are not lanes if needed, though here targetLaneId comes from a lane
    
    setLanes(prevLanes => {
      const newLanes = prevLanes.map(lane => ({ ...lane, tasks: [...lane.tasks] }));
      const sourceLane = newLanes.find(lane => lane.id === sourceLaneId);
      const targetLane = newLanes.find(lane => lane.id === targetLaneId);

      if (!sourceLane || !targetLane) return prevLanes;

      const taskIndex = sourceLane.tasks.findIndex(task => task.id === taskId);
      if (taskIndex === -1) return prevLanes;

      const [taskToMove] = sourceLane.tasks.splice(taskIndex, 1);
      
      // Reordering logic if needed when sourceLaneId === targetLaneId
      // For now, just add to the end. If you want specific positioning, you'd need more info from the drop event.
      targetLane.tasks.push(taskToMove);
      
      return newLanes;
    });
    setDraggedTaskInfo(null); // Clear dragged item info
  };

  const handleOpenAddTaskDialog = (laneId: string) => {
    setCurrentLaneIdForAddingTask(laneId);
    setIsAddTaskDialogOpen(true);
  };

  const handleAddTask = (taskContent: string) => {
    if (!currentLaneIdForAddingTask) return;

    const newTask: Task = {
      id: `task-${crypto.randomUUID()}`,
      content: taskContent,
    };

    setLanes(prevLanes =>
      prevLanes.map(lane =>
        lane.id === currentLaneIdForAddingTask
          ? { ...lane, tasks: [...lane.tasks, newTask] }
          : lane
      )
    );
    toast({ title: "Task Added", description: `"${taskContent}" added to ${lanes.find(l=>l.id === currentLaneIdForAddingTask)?.title}.`, variant: "default" });
  };

  const handleSuggestTask = async () => {
    setIsSuggestingTask(true);
    try {
      const suggestInput: SuggestTaskInput = {
        lanes: lanes.map(lane => ({
          name: lane.title,
          tasks: lane.tasks.map(task => task.content),
        })),
      };
      
      const result: SuggestTaskOutput = await suggestTask(suggestInput);
      
      const targetLane = lanes.find(lane => lane.title === result.lane);
      if (targetLane) {
        const newTask: Task = {
          id: `task-${crypto.randomUUID()}`,
          content: result.task,
        };
        setLanes(prevLanes =>
          prevLanes.map(lane =>
            lane.id === targetLane.id
              ? { ...lane, tasks: [...lane.tasks, newTask] }
              : lane
          )
        );
        toast({ title: "AI Task Suggestion", description: `Suggested task "${result.task}" added to ${result.lane}.`, className: "bg-secondary text-secondary-foreground" });
      } else {
        toast({ title: "AI Suggestion Error", description: `Could not find lane "${result.lane}" to add suggested task.`, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error suggesting task:", error);
      toast({ title: "AI Suggestion Failed", description: "Could not get a task suggestion at this time.", variant: "destructive" });
    } finally {
      setIsSuggestingTask(false);
    }
  };
  
  if (!isClient) {
    // Basic loading state or null to prevent hydration errors for D&D elements
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 md:p-6 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Roadmapper</h1>
          <Button onClick={handleSuggestTask} disabled={isSuggestingTask} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {isSuggestingTask ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lightbulb className="mr-2 h-4 w-4" />
            )}
            Suggest Task
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto py-4 md:py-6">
        <div 
          className="flex gap-4 md:gap-6 overflow-x-auto pb-4"
          onDragEnd={handleDragEnd} // Handle drag end on the container
        >
          {lanes.map(lane => (
            <Swimlane
              key={lane.id}
              lane={lane}
              onDragStartTask={handleDragStart}
              onDragOverLane={handleDragOver}
              onDropTaskInLane={handleDrop}
              onOpenAddTaskDialog={handleOpenAddTaskDialog}
            />
          ))}
        </div>
      </main>

      <AddTaskDialog
        open={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        onAddTask={handleAddTask}
        laneTitle={lanes.find(lane => lane.id === currentLaneIdForAddingTask)?.title || ''}
      />
    </div>
  );
}
