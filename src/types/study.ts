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
