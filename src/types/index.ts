export interface Task {
  id: string;
  content: string;
}

export interface Lane {
  id: string;
  title: string;
  tasks: Task[];
}
