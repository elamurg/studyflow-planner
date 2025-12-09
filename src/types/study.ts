export interface TimeBlock {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  startHour: number; // 0-23
  day: number; // 0-6 (Sunday-Saturday)
  color: 'purple' | 'orange' | 'cyan' | 'pink';
  completed: boolean;
}

export interface Deadline {
  id: string;
  title: string;
  className: string;
  dueDate: Date;
  color: 'purple' | 'orange' | 'cyan' | 'pink';
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface ClassSubject {
  id: string;
  name: string;
  color: 'purple' | 'orange' | 'cyan' | 'pink';
  tasks: Task[];
}

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
}
