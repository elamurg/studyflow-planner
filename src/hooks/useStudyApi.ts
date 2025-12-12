/**
 * Custom hooks for StudyFlow API integration
 * Uses React Query for data fetching, caching, and synchronization
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { StudySession, Deadline as ApiDeadline, StudyItem, Note as ApiNote, Subject } from '@/lib/api';
import type { TimeBlock, Deadline, Note, Task, ClassSubject } from '@/types/study';

// =============================================================================
// CONVERSION HELPERS
// =============================================================================

function apiSessionToTimeBlock(session: StudySession): TimeBlock {
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
    completed: session.is_completed || false,
  };
}

function timeBlockToApiSession(block: Omit<TimeBlock, 'id'> & { id?: string }): Omit<StudySession, 'id' | 'created_at' | 'updated_at'> {
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

function apiDeadlineToDeadline(apiDeadline: ApiDeadline): Deadline {
  return {
    id: String(apiDeadline.id),
    title: apiDeadline.title,
    className: apiDeadline.subject || '',
    dueDate: new Date(apiDeadline.due_date),
    color: (apiDeadline.color as Deadline['color']) || 'orange',
  };
}

function deadlineToApiDeadline(deadline: Omit<Deadline, 'id'>): Omit<ApiDeadline, 'id' | 'created_at' | 'updated_at' | 'is_completed'> {
  return {
    title: deadline.title,
    subject: deadline.className,
    due_date: deadline.dueDate.toISOString(),
    color: deadline.color,
  };
}

function apiNoteToNote(apiNote: ApiNote): Note {
  return {
    id: String(apiNote.id),
    content: apiNote.content,
    createdAt: new Date(apiNote.created_at || Date.now()),
  };
}

// =============================================================================
// TIME BLOCKS (Study Sessions)
// =============================================================================

export function useTimeBlocks() {
  return useQuery({
    queryKey: ['timeBlocks'],
    queryFn: async () => {
      const sessions = await api.sessions.getAll();
      return sessions.map(apiSessionToTimeBlock);
    },
  });
}

export function useCreateTimeBlock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (block: Omit<TimeBlock, 'id'>) => {
      const apiData = timeBlockToApiSession(block);
      return api.sessions.create(apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeBlocks'] });
    },
  });
}

export function useUpdateTimeBlock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (block: TimeBlock) => {
      const apiData = timeBlockToApiSession(block);
      return api.sessions.update(parseInt(block.id), apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeBlocks'] });
    },
  });
}

export function useDeleteTimeBlock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return api.sessions.delete(parseInt(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeBlocks'] });
    },
  });
}

export function useMoveTimeBlock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, newDay, newHour }: { id: string; newDay: number; newHour: number }) => {
      const currentSession = await api.sessions.getById(parseInt(id));
      const currentBlock = apiSessionToTimeBlock(currentSession);
      
      const updatedBlock: TimeBlock = {
        ...currentBlock,
        day: newDay,
        startHour: newHour,
      };
      
      const apiData = timeBlockToApiSession(updatedBlock);
      return api.sessions.update(parseInt(id), apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeBlocks'] });
    },
  });
}

export function useToggleTimeBlockComplete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      return api.sessions.update(parseInt(id), { is_completed: completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeBlocks'] });
    },
  });
}

// =============================================================================
// DEADLINES
// =============================================================================

export function useDeadlines() {
  return useQuery({
    queryKey: ['deadlines'],
    queryFn: async () => {
      const deadlines = await api.deadlines.getAll();
      return deadlines.map(apiDeadlineToDeadline);
    },
  });
}

export function useCreateDeadline() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (deadline: Omit<Deadline, 'id'>) => {
      const apiData = deadlineToApiDeadline(deadline);
      return api.deadlines.create(apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
    },
  });
}

export function useDeleteDeadline() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return api.deadlines.delete(parseInt(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
    },
  });
}

// =============================================================================
// NOTES
// =============================================================================

export function useNotes() {
  return useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const notes = await api.notes.getAll();
      return notes.map(apiNoteToNote);
    },
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (content: string) => {
      return api.notes.create({ title: 'Note', content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return api.notes.delete(parseInt(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

// =============================================================================
// CLASSES (Subjects) & TASKS (Study Items)
// =============================================================================

export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const [subjects, items] = await Promise.all([
        api.subjects.getAll(),
        api.items.getAll(),
      ]);
      
      const classes: ClassSubject[] = subjects.map(subject => ({
        id: String(subject.id),
        name: subject.name,
        color: (subject.color as ClassSubject['color']) || 'purple',
        tasks: items
          .filter(item => item.subject === subject.name)
          .map(item => ({
            id: String(item.id),
            title: item.title,
            completed: item.is_completed || false,
          })),
      }));
      
      return classes;
    },
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (classData: Omit<ClassSubject, 'id' | 'tasks'>) => {
      return api.subjects.create({
        name: classData.name,
        color: classData.color,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ title, subject }: { title: string; subject: string }) => {
      return api.items.create({
        title,
        subject,
        is_completed: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}

export function useToggleTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      return api.items.toggleComplete(parseInt(id), completed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return api.items.delete(parseInt(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}

// =============================================================================
// PROGRESS
// =============================================================================

export function useProgress() {
  return useQuery({
    queryKey: ['progress'],
    queryFn: () => api.items.getProgress(),
  });
}