/**
 * StudyFlow API Service
 * 
 * This file handles all communication between your React frontend and Flask backend.
 * Place this file in: src/lib/api.ts
 * 
 * Usage in components:
 *   import { api } from '@/lib/api';
 *   const sessions = await api.sessions.getAll();
 */

// Set this to your deployed backend URL in production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// =============================================================================
// TYPES
// =============================================================================

export interface StudySession {
  id?: number;
  title: string;
  description?: string;
  subject?: string;
  color?: string;
  start_time: string;  // ISO format
  end_time: string;    // ISO format
  is_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Deadline {
  id?: number;
  title: string;
  description?: string;
  subject?: string;
  color?: string;
  due_date: string;  // ISO format
  priority?: 'low' | 'medium' | 'high';
  is_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StudyItem {
  id?: number;
  title: string;
  description?: string;
  subject?: string;
  is_completed?: boolean;
  order?: number;
  deadline_id?: number;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}

export interface Note {
  id?: number;
  title: string;
  content: string;
  subject?: string;
  session_id?: number;
  show_date?: string;  // ISO format - when to show this "future self" note
  created_at?: string;
  updated_at?: string;
}

export interface Subject {
  id?: number;
  name: string;
  color?: string;
  created_at?: string;
}

export interface ProgressStats {
  total: number;
  completed: number;
  percentage: number;
  by_subject: Record<string, {
    total: number;
    completed: number;
    percentage: number;
  }>;
}

// =============================================================================
// API HELPER
// =============================================================================

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// =============================================================================
// API METHODS
// =============================================================================

export const api = {
  // -------------------------------------------------------------------------
  // STUDY SESSIONS
  // -------------------------------------------------------------------------
  sessions: {
    getAll: (params?: { start?: string; end?: string }) => {
      const query = new URLSearchParams();
      if (params?.start) query.set('start', params.start);
      if (params?.end) query.set('end', params.end);
      const queryString = query.toString();
      return fetchAPI<StudySession[]>(`/sessions${queryString ? `?${queryString}` : ''}`);
    },
    
    getById: (id: number) => 
      fetchAPI<StudySession>(`/sessions/${id}`),
    
    create: (session: Omit<StudySession, 'id' | 'created_at' | 'updated_at'>) =>
      fetchAPI<StudySession>('/sessions', {
        method: 'POST',
        body: JSON.stringify(session),
      }),
    
    update: (id: number, session: Partial<StudySession>) =>
      fetchAPI<StudySession>(`/sessions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(session),
      }),
    
    delete: (id: number) =>
      fetchAPI<void>(`/sessions/${id}`, { method: 'DELETE' }),
  },

  // -------------------------------------------------------------------------
  // DEADLINES
  // -------------------------------------------------------------------------
  deadlines: {
    getAll: (params?: { completed?: boolean; subject?: string }) => {
      const query = new URLSearchParams();
      if (params?.completed !== undefined) query.set('completed', String(params.completed));
      if (params?.subject) query.set('subject', params.subject);
      const queryString = query.toString();
      return fetchAPI<Deadline[]>(`/deadlines${queryString ? `?${queryString}` : ''}`);
    },
    
    getById: (id: number) => 
      fetchAPI<Deadline>(`/deadlines/${id}`),
    
    create: (deadline: Omit<Deadline, 'id' | 'created_at' | 'updated_at'>) =>
      fetchAPI<Deadline>('/deadlines', {
        method: 'POST',
        body: JSON.stringify(deadline),
      }),
    
    update: (id: number, deadline: Partial<Deadline>) =>
      fetchAPI<Deadline>(`/deadlines/${id}`, {
        method: 'PUT',
        body: JSON.stringify(deadline),
      }),
    
    delete: (id: number) =>
      fetchAPI<void>(`/deadlines/${id}`, { method: 'DELETE' }),
  },

  // -------------------------------------------------------------------------
  // STUDY ITEMS (Checklist)
  // -------------------------------------------------------------------------
  items: {
    getAll: (params?: { completed?: boolean; subject?: string; deadline_id?: number }) => {
      const query = new URLSearchParams();
      if (params?.completed !== undefined) query.set('completed', String(params.completed));
      if (params?.subject) query.set('subject', params.subject);
      if (params?.deadline_id) query.set('deadline_id', String(params.deadline_id));
      const queryString = query.toString();
      return fetchAPI<StudyItem[]>(`/items${queryString ? `?${queryString}` : ''}`);
    },
    
    create: (item: Omit<StudyItem, 'id' | 'created_at' | 'updated_at' | 'completed_at'>) =>
      fetchAPI<StudyItem>('/items', {
        method: 'POST',
        body: JSON.stringify(item),
      }),
    
    update: (id: number, item: Partial<StudyItem>) =>
      fetchAPI<StudyItem>(`/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(item),
      }),
    
    delete: (id: number) =>
      fetchAPI<void>(`/items/${id}`, { method: 'DELETE' }),
    
    // Toggle completion status
    toggleComplete: (id: number, is_completed: boolean) =>
      fetchAPI<StudyItem>(`/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_completed }),
      }),
    
    // Get progress stats
    getProgress: () =>
      fetchAPI<ProgressStats>('/items/progress'),
  },

  // -------------------------------------------------------------------------
  // NOTES
  // -------------------------------------------------------------------------
  notes: {
    getAll: (params?: { subject?: string; session_id?: number; show_today?: boolean }) => {
      const query = new URLSearchParams();
      if (params?.subject) query.set('subject', params.subject);
      if (params?.session_id) query.set('session_id', String(params.session_id));
      if (params?.show_today) query.set('show_today', 'true');
      const queryString = query.toString();
      return fetchAPI<Note[]>(`/notes${queryString ? `?${queryString}` : ''}`);
    },
    
    create: (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) =>
      fetchAPI<Note>('/notes', {
        method: 'POST',
        body: JSON.stringify(note),
      }),
    
    update: (id: number, note: Partial<Note>) =>
      fetchAPI<Note>(`/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(note),
      }),
    
    delete: (id: number) =>
      fetchAPI<void>(`/notes/${id}`, { method: 'DELETE' }),
  },

  // -------------------------------------------------------------------------
  // SUBJECTS
  // -------------------------------------------------------------------------
  subjects: {
    getAll: () =>
      fetchAPI<Subject[]>('/subjects'),
    
    create: (subject: Omit<Subject, 'id' | 'created_at'>) =>
      fetchAPI<Subject>('/subjects', {
        method: 'POST',
        body: JSON.stringify(subject),
      }),
    
    delete: (id: number) =>
      fetchAPI<void>(`/subjects/${id}`, { method: 'DELETE' }),
  },

  // -------------------------------------------------------------------------
  // HEALTH CHECK
  // -------------------------------------------------------------------------
  health: () =>
    fetchAPI<{ status: string; timestamp: string }>('/health'),
};

// =============================================================================
// REACT QUERY HOOKS (Optional - if you want to use these with TanStack Query)
// =============================================================================

// Example usage with React Query:
// 
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { api } from '@/lib/api';
// 
// // Fetch all sessions
// const { data: sessions, isLoading } = useQuery({
//   queryKey: ['sessions'],
//   queryFn: () => api.sessions.getAll(),
// });
// 
// // Create a new session
// const queryClient = useQueryClient();
// const createSession = useMutation({
//   mutationFn: api.sessions.create,
//   onSuccess: () => {
//     queryClient.invalidateQueries({ queryKey: ['sessions'] });
//   },
// });