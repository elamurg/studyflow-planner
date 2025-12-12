// Frontend types (used in components)
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
  classId?: string;
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

// =============================================================================
// API Response Types (what the backend returns)
// =============================================================================

export interface ApiStudySession {
  id: number;
  title: string;
  description?: string;
  subject?: string;
  color?: string;
  start_time: string;
  end_time: string;
  is_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ApiDeadline {
  id: number;
  title: string;
  description?: string;
  subject?: string;
  color?: string;
  due_date: string;
  priority?: string;
  is_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ApiStudyItem {
  id: number;
  title: string;
  description?: string;
  subject?: string;
  is_completed: boolean;
  order?: number;
  deadline_id?: number;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}

export interface ApiNote {
  id: number;
  title: string;
  content: string;
  subject?: string;
  session_id?: number;
  show_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiSubject {
  id: number;
  name: string;
  color?: string;
  created_at?: string;
}

// =============================================================================
// Conversion Functions (API <-> Frontend)
// =============================================================================

/**
 * Convert API study session to frontend TimeBlock format
 */
export function apiSessionToTimeBlock(session: ApiStudySession): TimeBlock {
  const startDate = new Date(session.start_time);
  const endDate = new Date(session.end_time);
  const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  
  return {
    id: String(session.id),
    title: session.title,
    description: session.description || '',
    duration,
    startHour: startDate.getHours(),
    day: startDate.getDay(),
    color: (session.color as TimeBlock['color']) || 'purple',
    completed: session.is_completed,
  };
}

/**
 * Convert frontend TimeBlock to API session format
 */
export function timeBlockToApiSession(block: Omit<TimeBlock, 'id'> & { id?: string }): {
  title: string;
  description?: string;
  color: string;
  start_time: string;
  end_time: string;
  is_completed: boolean;
} {
  // Calculate the actual date based on day of week
  const now = new Date();
  const currentDay = now.getDay();
  const daysUntilTarget = (block.day - currentDay + 7) % 7;
  
  const startDate = new Date(now);
  startDate.setDate(now.getDate() + daysUntilTarget);
  startDate.setHours(block.startHour, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setMinutes(startDate.getMinutes() + block.duration);
  
  return {
    title: block.title,
    description: block.description,
    color: block.color,
    start_time: startDate.toISOString(),
    end_time: endDate.toISOString(),
    is_completed: block.completed,
  };
}

/**
 * Convert API deadline to frontend Deadline format
 */
export function apiDeadlineToDeadline(apiDeadline: ApiDeadline): Deadline {
  return {
    id: String(apiDeadline.id),
    title: apiDeadline.title,
    className: apiDeadline.subject || '',
    dueDate: new Date(apiDeadline.due_date),
    color: (apiDeadline.color as Deadline['color']) || 'orange',
  };
}

/**
 * Convert frontend Deadline to API format
 */
export function deadlineToApiDeadline(deadline: Omit<Deadline, 'id'>): {
  title: string;
  subject: string;
  due_date: string;
  color: string;
} {
  return {
    title: deadline.title,
    subject: deadline.className,
    due_date: deadline.dueDate.toISOString(),
    color: deadline.color,
  };
}

/**
 * Convert API note to frontend Note format
 */
export function apiNoteToNote(apiNote: ApiNote): Note {
  return {
    id: String(apiNote.id),
    content: apiNote.content,
    createdAt: new Date(apiNote.created_at || Date.now()),
  };
}

/**
 * Convert frontend Note to API format
 */
export function noteToApiNote(note: Omit<Note, 'id' | 'createdAt'>): {
  title: string;
  content: string;
} {
  return {
    title: 'Note', // We use the content as the main thing
    content: note.content,
  };
}

/**
 * Convert API study item to frontend Task format
 */
export function apiItemToTask(item: ApiStudyItem): Task {
  return {
    id: String(item.id),
    title: item.title,
    completed: item.is_completed,
    classId: item.subject,
  };
}

/**
 * Convert API subject to frontend ClassSubject format
 */
export function apiSubjectToClass(subject: ApiSubject, tasks: ApiStudyItem[]): ClassSubject {
  return {
    id: String(subject.id),
    name: subject.name,
    color: (subject.color as ClassSubject['color']) || 'purple',
    tasks: tasks
      .filter(t => t.subject === subject.name)
      .map(apiItemToTask),
  };
}