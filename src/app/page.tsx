
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
    id: 'releases',
    title: 'Releases',
    color: 'hsl(340 72% 50%)', // Pink/Red
    textColor: 'text-white',
    tasks: [
      { id: 'task-r1', content: 'V1.0.0 Release' },
      { id: 'task-r2', content: 'V1.0.1 Patch' },
    ],
  },
  {
    id: 'milestones',
    title: 'Milestones',
    color: 'hsl(28 100% 53%)', // Orange
    textColor: 'text-white',
    tasks: [
      { id: 'task-m1', content: 'Project Kick-off' },
      { id: 'task-m2', content: 'Alpha Release' },
      { id: 'task-m3', content: 'Beta Program Launch' },
      { id: 'task-m4', content: 'Achieve 1,000 Active Users' },
    ],
  },
  {
    id: 'product',
    title: 'Product Features',
    color: 'hsl(45 100% 51%)', // Yellow
    textColor: 'text-neutral-800',
    tasks: [
      { id: 'task-p1', content: 'User Authentication System' },
      { id: 'task-p2', content: 'Dashboard UI/UX Design' },
      { id: 'task-p3', content: 'Reporting Module' },
      { id: 'task-p4', content: 'Third-party API Integration (e.g., Stripe)' },
    ],
  },
  {
    id: 'dev',
    title: 'Development',
    color: 'hsl(120 50% 45%)', // Green
    textColor: 'text-white',
    tasks: [
      { id: 'task-d1', content: 'Setup CI/CD Pipeline' },
      { id: 'task-d2', content: 'Backend API for User Profiles' },
      { id: 'task-d3', content: 'Frontend Component Library Setup' },
      { id: 'task-d4', content: 'Database Schema Design' },
    ],
  },
  {
    id: 'ux-ui',
    title: 'UX & UI',
    color: 'hsl(180 65% 40%)', // Teal
    textColor: 'text-white',
    tasks: [
      { id: 'task-ux1', content: 'User Persona Definition' },
      { id: 'task-ux2', content: 'Wireframing Key Screens' },
      { id: 'task-ux3', content: 'High-Fidelity Mockups' },
      { id: 'task-ux4', content: 'Usability Testing Round 1' },
    ],
  },
  {
    id: 'strategy',
    title: 'Strategy & Marketing',
    color: 'hsl(210 65% 45%)', // Blue
    textColor: 'text-white',
    tasks: [
      { id: 'task-s1', content: 'Competitor Analysis Q1' },
      { id: 'task-s2', content: 'Content Marketing Plan' },
      { id: 'task-s3', content: 'Social Media Campaign Launch' },
    ],
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
    event.currentTarget.classList.add('opacity-50');
  };
  
  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove('opacity-50');
    setDraggedTaskInfo(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); 
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, targetLaneId: string) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('taskId');
    const sourceLaneId = event.dataTransfer.getData('sourceLaneId');

    if (!taskId || !sourceLaneId) return;
    
    setLanes(prevLanes => {
      const newLanes = prevLanes.map(lane => ({ ...lane, tasks: [...lane.tasks] }));
      const sourceLane = newLanes.find(lane => lane.id === sourceLaneId);
      const targetLane = newLanes.find(lane => lane.id === targetLaneId);

      if (!sourceLane || !targetLane) return prevLanes;

      const taskIndex = sourceLane.tasks.findIndex(task => task.id === taskId);
      if (taskIndex === -1) return prevLanes;

      const [taskToMove] = sourceLane.tasks.splice(taskIndex, 1);
      
      targetLane.tasks.push(taskToMove);
      
      return newLanes;
    });
    setDraggedTaskInfo(null); 
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Product Development Roadmap</h1>
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-4"
          onDragEnd={handleDragEnd}
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
