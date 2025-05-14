export interface Task {
  id: string;
  content: string;
}

export interface Lane {
  id: string;
  title: string;
  tasks: Task[];
  color?: string; // HSL string for background
  textColor?: string; // Tailwind class for text color
}
