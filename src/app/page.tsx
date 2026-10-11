"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { MemoryInput } from "@/data/memories";
import { useMemories } from "@/hooks/useMemories";
import type { ZoomCommand } from "@/components/Canvas/Scene";
import { MemoryModal } from "@/components/UI/MemoryModal";
import { MemoryForm } from "@/components/UI/MemoryForm";
import { MemoryManager } from "@/components/UI/MemoryManager";

// WebGL needs the browser — skip server rendering for the canvas.
const Scene = dynamic(
  () => import("@/components/Canvas/Scene").then((mod) => mod.Scene),
  { ssr: false },
);

type FormState = { mode: "create" } | { mode: "edit"; id: string } | null;

const roundButton = "btn-ghost flex h-11 w-11 items-center justify-center";

export default function Home(): React.JSX.Element {
  const { memories, isReady, error, clearError, add, update, remove, reset } =
    useMemories();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(null);
  const [managerOpen, setManagerOpen] = useState(false);
  const [zoomCommand, setZoomCommand] = useState<ZoomCommand | null>(null);

  const selectedMemory = useMemo(
    () => memories.find((memory) => memory.id === selectedId) ?? null,
    [memories, selectedId],
  );

  const editingMemory = useMemo(
    () =>
      form?.mode === "edit"
        ? (memories.find((memory) => memory.id === form.id) ?? null)
        : null,
    [memories, form],
  );

  const handleSelect = useCallback((id: string): void => setSelectedId(id), []);
  const handleCloseModal = useCallback((): void => setSelectedId(null), []);
  const handleCloseForm = useCallback((): void => setForm(null), []);
  const handleCloseManager = useCallback((): void => setManagerOpen(false), []);

  const handleZoom = useCallback((direction: 1 | -1): void => {
    setZoomCommand((prev) => ({ seq: (prev?.seq ?? 0) + 1, direction }));
  }, []);

  const handleCreate = useCallback((): void => {
    setSelectedId(null);
    setForm({ mode: "create" });
  }, []);

  const handleEdit = useCallback((id: string): void => {
    setSelectedId(null);
    setManagerOpen(false);
    setForm({ mode: "edit", id });
  }, []);

  const handleOpenFromManager = useCallback((id: string): void => {
    setManagerOpen(false);
    setSelectedId(id);
  }, []);

  const handleDeleteFromModal = useCallback(
    (id: string): void => {
      remove(id);
      setSelectedId(null);
    },
    [remove],
  );

  const handleSubmit = useCallback(
    (input: MemoryInput): void => {
      if (form?.mode === "edit") {
        update(form.id, input);
        setSelectedId(form.id);
      } else {
        setSelectedId(add(input).id);
      }
      setForm(null);
    },
    [form, add, update],
  );

  const isEmpty = isReady && memories.length === 0;

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#020207]">
      {/* Simple galaxy backdrop: black with a few faint white streaks */}
      <div className="galaxy-bg" aria-hidden="true">
        <div className="galaxy-drift">
          <div
            className="galaxy-streak"
            style={
              {
                width: "130vmax",
                height: "14vmax",
                "--a": 0.1,
                "--b": "40px",
              } as React.CSSProperties
            }
          />
          <div
            className="galaxy-streak"
            style={
              {
                width: "100vmax",
                height: "5vmax",
                "--x": "6vw",
                "--y": "-4vh",
                "--a": 0.09,
                "--b": "22px",
              } as React.CSSProperties
            }
          />
          <div
            className="galaxy-streak"
            style={
              {
                width: "80vmax",
                height: "9vmax",
                "--r": "-34deg",
                "--x": "-18vw",
                "--y": "22vh",
                "--a": 0.05,
                "--b": "36px",
              } as React.CSSProperties
            }
          />
          <div
            className="galaxy-streak"
            style={
              {
                width: "60vmax",
                height: "3vmax",
                "--r": "-22deg",
                "--x": "20vw",
                "--y": "-26vh",
                "--a": 0.06,
                "--b": "18px",
              } as React.CSSProperties
            }
          />
          <div className="galaxy-hairline" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(1,1,3,0)_40%,rgba(1,1,3,0.75)_100%)]" />
      </div>

      {/* 3D scene */}
      <div className="absolute inset-0">
        <Scene
          memories={memories}
          selectedId={selectedId}
          onSelect={handleSelect}
          zoomCommand={zoomCommand}
        />
      </div>

      {/* Title overlay */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center px-4 pt-6 text-center sm:pt-10">
        <h1 className="font-display opacity-50 text-4xl font-semibold text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.3)] sm:text-6xl">
          My Universe
        </h1>
      </header>

      {/* Zoom controls */}
      <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2 sm:right-5">
        <button
          type="button"
          onClick={() => handleZoom(1)}
          aria-label="Phóng to"
          className={roundButton}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => handleZoom(-1)}
          aria-label="Thu nhỏ"
          className={roundButton}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-3 px-6 text-center">
          <p className="text-sm text-white/80 sm:text-base">
            Chưa có kỷ niệm nào. Hãy thêm kỷ niệm đầu tiên để ảnh bắt đầu xoay
            quanh.
          </p>
          <button
            type="button"
            onClick={reset}
            className="btn-ghost px-4 py-1.5 text-xs"
          >
            Khôi phục dữ liệu mẫu
          </button>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-3 px-4 sm:bottom-10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCreate}
            disabled={!isReady}
            className="btn-ghost btn-borderless opacity-50 hover:opacity-100 flex items-center gap-2 px-5 py-2.5 text-sm"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Thêm kỷ niệm
          </button>
          <button
            type="button"
            onClick={() => setManagerOpen(true)}
            disabled={!isReady}
            className="btn-ghost btn-borderless opacity-50 hover:opacity-100 flex items-center gap-2 px-4 py-2.5 text-sm"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            Quản lý ({memories.length})
          </button>
        </div>
      </div>

      {/* Storage error toast */}
      {error && (
        <div
          role="alert"
          className="absolute inset-x-4 top-24 z-40 mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-rose-400/40 bg-rose-500/20 px-4 py-3 text-sm text-rose-50 backdrop-blur-md sm:top-28"
        >
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={clearError}
            aria-label="Đóng thông báo"
            className="text-rose-100/80 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            ✕
          </button>
        </div>
      )}

      <MemoryManager
        open={managerOpen}
        memories={memories}
        onClose={handleCloseManager}
        onOpenMemory={handleOpenFromManager}
        onEdit={handleEdit}
        onDelete={remove}
      />

      <MemoryModal
        memory={selectedMemory}
        onClose={handleCloseModal}
        onEdit={handleEdit}
        onDelete={handleDeleteFromModal}
      />

      <MemoryForm
        open={form !== null}
        initial={editingMemory}
        onSubmit={handleSubmit}
        onCancel={handleCloseForm}
      />
    </main>
  );
}
