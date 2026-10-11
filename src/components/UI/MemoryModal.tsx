"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { Memory } from "@/data/memories";
import { formatDate } from "@/lib/format";

interface MemoryModalProps {
  memory: Memory | null;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.25, delay: 0.1 } },
};

export function MemoryModal({
  memory,
  onClose,
  onEdit,
  onDelete,
}: MemoryModalProps): React.JSX.Element {
  const reduceMotion = useReducedMotion() ?? false;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isOpen = memory !== null;
  // Tracks which memory is awaiting delete confirmation (so it resets when another opens)
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // Escape to close, lock page scroll, move focus to the close button
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  const unfoldDelay = reduceMotion ? 0 : 0.45;

  return (
    <AnimatePresence>
      {memory && (
        <motion.div
          key="memory-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="dialog"
          aria-modal="true"
          aria-labelledby="memory-title"
        >
          {/* Backdrop — click to close */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Card: scales up from the center */}
          <motion.div
            className="relative z-10 flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-lg border border-white/15 bg-white/[0.04] backdrop-blur-md sm:max-w-lg"
            style={{ perspective: 1400 }}
            initial={{ scale: reduceMotion ? 1 : 0.4, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              transition: { type: "spring", stiffness: 220, damping: 24 },
            }}
            exit={{
              scale: reduceMotion ? 1 : 0.6,
              opacity: 0,
              transition: { duration: 0.25, ease: "easeIn" },
            }}
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close memory"
              className="btn-ghost btn-borderless absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center opacity-50 hover:opacity-100"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <div className="flex min-h-0 flex-col overflow-y-auto">
              {/* Photo (the "front cover") */}
              <div className="relative shrink-0 p-3 pb-0">
                <div className="overflow-hidden rounded-md border border-white/15">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={memory.imageUrl}
                    alt={memory.title}
                    className="aspect-[4/3] max-h-[46dvh] w-full object-cover"
                    draggable={false}
                  />
                </div>
              </div>

              {/* Note — unfolds downward from the photo's bottom edge */}
              <motion.div
                className="origin-top p-5 sm:p-6"
                style={{ transformStyle: "preserve-3d" }}
                initial={{ rotateX: reduceMotion ? 0 : -90, opacity: 0 }}
                animate={{
                  rotateX: 0,
                  opacity: 1,
                  transition: {
                    delay: unfoldDelay,
                    type: "spring",
                    stiffness: 120,
                    damping: 18,
                  },
                }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
              >
                <p className="inline-flex items-center gap-2 text-xs font-medium text-white/60">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 5 6 5c2 0 3.4 1.1 4 2.3h4c.6-1.2 2-2.3 4-2.3 3.3 0 5.1 3.4 3.6 6.8C19.5 16.4 12 21 12 21z" />
                  </svg>
                  <time dateTime={memory.date}>{formatDate(memory.date)}</time>
                </p>

                <h2
                  id="memory-title"
                  className="font-display mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl"
                >
                  {memory.title}
                </h2>

                <p className="mt-3 max-w-prose text-sm leading-relaxed text-white/80 sm:text-base">
                  {memory.description}
                </p>

                <div className="mt-5 flex items-center justify-end gap-2 border-t border-white/15 pt-4">
                  {confirmId === memory.id ? (
                    <>
                      <span className="mr-auto text-sm text-white/80">
                        Xóa kỷ niệm này?
                      </span>
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="btn-ghost btn-borderless px-4 py-1.5 text-sm opacity-50 hover:opacity-100"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(memory.id)}
                        className="btn-ghost btn-borderless btn-danger px-4 py-1.5 text-sm opacity-50 hover:opacity-100"
                      >
                        Xóa
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => onEdit(memory.id)}
                        className="btn-ghost btn-borderless px-4 py-1.5 text-sm opacity-50 hover:opacity-100"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(memory.id)}
                        className="btn-ghost btn-borderless btn-danger px-4 py-1.5 text-sm opacity-50 hover:opacity-100"
                      >
                        Xóa
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
