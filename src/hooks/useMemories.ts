'use client';

import { useCallback, useEffect, useState } from 'react';
import { memories as seedMemories } from '@/data/memories';
import type { Memory, MemoryInput } from '@/data/memories';

const STORAGE_KEY = 'memory-universe:v1';

function isMemory(value: unknown): value is Memory {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.title === 'string' &&
    typeof record.date === 'string' &&
    typeof record.description === 'string' &&
    typeof record.imageUrl === 'string'
  );
}

/** Returns null when nothing valid is stored yet (first visit or corrupted data). */
function readStorage(): Memory[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(isMemory);
  } catch {
    return null;
  }
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface UseMemories {
  memories: Memory[];
  /** false until localStorage has been read (avoids a flash of sample data / hydration mismatch). */
  isReady: boolean;
  error: string | null;
  clearError: () => void;
  add: (input: MemoryInput) => Memory;
  update: (id: string, input: MemoryInput) => void;
  remove: (id: string) => void;
  /** Restore the built-in sample memories. */
  reset: () => void;
}

export function useMemories(): UseMemories {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load once on mount (client only)
  useEffect(() => {
    const stored = readStorage();
    setMemories(stored ?? seedMemories);
    setIsReady(true);
  }, []);

  // Persist on every change after the initial load
  useEffect(() => {
    if (!isReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
    } catch {
      setError(
        'Bộ nhớ trình duyệt đã đầy nên thay đổi chưa được lưu. Hãy xóa bớt ảnh hoặc dùng ảnh nhỏ hơn.',
      );
    }
  }, [memories, isReady]);

  const clearError = useCallback((): void => setError(null), []);

  const add = useCallback((input: MemoryInput): Memory => {
    const created: Memory = { id: createId(), ...input };
    setMemories((prev) => [...prev, created]);
    return created;
  }, []);

  const update = useCallback((id: string, input: MemoryInput): void => {
    setMemories((prev) =>
      prev.map((memory) => (memory.id === id ? { id, ...input } : memory)),
    );
  }, []);

  const remove = useCallback((id: string): void => {
    setMemories((prev) => prev.filter((memory) => memory.id !== id));
  }, []);

  const reset = useCallback((): void => setMemories(seedMemories), []);

  return { memories, isReady, error, clearError, add, update, remove, reset };
}
