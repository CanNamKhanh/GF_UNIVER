'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Memory } from '@/data/memories';
import { formatDate } from '@/lib/format';

interface MemoryManagerProps {
  open: boolean;
  memories: Memory[];
  onClose: () => void;
  onOpenMemory: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

/** Side drawer listing every photo, with quick view / edit / delete. */
export function MemoryManager({
  open,
  memories,
  onClose,
  onOpenMemory,
  onEdit,
  onDelete,
}: MemoryManagerProps): React.JSX.Element {
  const reduceMotion = useReducedMotion() ?? false;
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence
      onExitComplete={() => setConfirmId(null)}
    >
      {open && (
        <motion.div
          key="manager"
          className="fixed inset-0 z-[55] flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.2 } }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="manager-title"
        >
          <div
            className="absolute inset-0 bg-[#05030f]/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.aside
            className="relative flex h-full w-full max-w-sm flex-col border-l border-white/15 bg-[#0d0a24]/70 shadow-[-20px_0_60px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            initial={{ x: reduceMotion ? 0 : '100%' }}
            animate={{ x: 0, transition: { type: 'spring', stiffness: 260, damping: 30 } }}
            exit={{ x: reduceMotion ? 0 : '100%', transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between px-5 pb-3 pt-5">
              <h2 id="manager-title" className="font-display text-2xl font-semibold text-white">
                Ảnh của bạn
                <span className="ml-2 text-base font-normal text-white/50">{memories.length}</span>
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng danh sách"
                className="btn-ghost flex h-9 w-9 items-center justify-center"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {memories.length === 0 ? (
              <p className="px-5 py-8 text-sm text-white/60">Chưa có ảnh nào.</p>
            ) : (
              <ul className="flex-1 space-y-2 overflow-y-auto px-4 pb-6">
                {memories.map((memory) => {
                  const isConfirming = confirmId === memory.id;
                  return (
                    <li
                      key={memory.id}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-2.5 transition hover:bg-white/10"
                    >
                      <button
                        type="button"
                        onClick={() => onOpenMemory(memory.id)}
                        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                        aria-label={`Mở kỷ niệm ${memory.title}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={memory.imageUrl}
                          alt=""
                          className="h-16 w-12 shrink-0 rounded-lg object-cover"
                          draggable={false}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-white">{memory.title}</span>
                          <span className="block text-xs text-white/50">{formatDate(memory.date)}</span>
                        </span>
                      </button>

                      {isConfirming ? (
                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            className="btn-ghost px-3 py-1 text-xs"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmId(null);
                              onDelete(memory.id);
                            }}
                            className="btn-ghost btn-danger px-3 py-1 text-xs"
                          >
                            Xóa
                          </button>
                        </div>
                      ) : (
                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEdit(memory.id)}
                            aria-label={`Sửa ${memory.title}`}
                            className="btn-ghost flex h-8 w-8 items-center justify-center"
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(memory.id)}
                            aria-label={`Xóa ${memory.title}`}
                            className="btn-ghost btn-danger flex h-8 w-8 items-center justify-center"
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10 11v5M14 11v5" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
