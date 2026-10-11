"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Memory, MemoryInput } from "@/data/memories";
import { fileToResizedDataUrl } from "@/lib/image";

interface MemoryFormProps {
  open: boolean;
  /** Memory being edited, or null to create a new one. */
  initial: Memory | null;
  onSubmit: (input: MemoryInput) => void;
  onCancel: () => void;
}

function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

const fieldClass =
  "w-full rounded-md border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/40 outline-none backdrop-blur-md transition focus:border-white/50";

const labelClass = "mb-1.5 block text-xs font-medium text-white/70";

const ghostButton = "btn-ghost btn-borderless opacity-50 hover:opacity-100";

interface FormDialogProps {
  initial: Memory | null;
  onSubmit: (input: MemoryInput) => void;
  onCancel: () => void;
}

/** Mounted only while open, so its state resets every time the dialog opens. */
function FormDialog({
  initial,
  onSubmit,
  onCancel,
}: FormDialogProps): React.JSX.Element {
  const reduceMotion = useReducedMotion() ?? false;
  const titleInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [date, setDate] = useState(initial?.date ?? todayIso());
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = initial !== null;
  // Don't dump a huge base64 string into the URL field
  const isDataUrl = imageUrl.startsWith("data:");

  useEffect(() => {
    titleInputRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onCancel]);

  const handleFile = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    try {
      setImageUrl(await fileToResizedDataUrl(file));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không xử lý được ảnh.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (isProcessing) return;

    const trimmedTitle = title.trim();
    const trimmedUrl = imageUrl.trim();

    if (!trimmedTitle) return setError("Hãy nhập tiêu đề cho kỷ niệm.");
    if (!date) return setError("Hãy chọn ngày.");
    if (!trimmedUrl) return setError("Hãy chọn một bức ảnh hoặc dán link ảnh.");

    onSubmit({
      title: trimmedTitle,
      date,
      description: description.trim(),
      imageUrl: trimmedUrl,
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.25 } }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="memory-form-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      <motion.form
        onSubmit={handleSubmit}
        noValidate
        className="relative z-10 flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-lg border border-white/15 bg-white/[0.04] backdrop-blur-md"
        initial={{
          scale: reduceMotion ? 1 : 0.85,
          opacity: 0,
          y: reduceMotion ? 0 : 24,
        }}
        animate={{
          scale: 1,
          opacity: 1,
          y: 0,
          transition: { type: "spring", stiffness: 260, damping: 26 },
        }}
        exit={{
          scale: reduceMotion ? 1 : 0.92,
          opacity: 0,
          transition: { duration: 0.2 },
        }}
      >
        <div className="flex items-center justify-between px-5 pt-5 sm:px-6">
          <h2
            id="memory-form-title"
            className="font-display text-2xl font-semibold text-white sm:text-3xl"
          >
            {isEdit ? "Sửa kỷ niệm" : "Thêm kỷ niệm mới"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Đóng"
            className={`${ghostButton} flex h-9 w-9 items-center justify-center`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto px-5 py-5 sm:px-6">
          {/* Photo */}
          <div>
            <span className={labelClass}>Ảnh</span>
            <div className="flex items-center gap-3">
              <div className="h-24 w-[4.5rem] shrink-0 overflow-hidden rounded-md border border-white/15 bg-black/30">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt="Xem trước"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-white/40">
                    Chưa có ảnh
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className={`${ghostButton} px-3 py-2 text-sm`}
                >
                  {isProcessing ? "Đang xử lý ảnh…" : "Chọn ảnh từ máy"}
                </button>
                <input
                  type="url"
                  inputMode="url"
                  value={isDataUrl ? "" : imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder={
                    isDataUrl
                      ? "Đã chọn ảnh từ máy"
                      : "hoặc dán link ảnh (https://…)"
                  }
                  className={fieldClass}
                  aria-label="Link ảnh"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="memory-title-input" className={labelClass}>
              Tiêu đề
            </label>
            <input
              id="memory-title-input"
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              placeholder="Ví dụ: Lần đầu gặp nhau"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="memory-date-input" className={labelClass}>
              Ngày
            </label>
            <input
              id="memory-date-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`${fieldClass} [color-scheme:dark]`}
            />
          </div>

          <div>
            <label htmlFor="memory-description-input" className={labelClass}>
              Lời nhắn
            </label>
            <textarea
              id="memory-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Viết vài dòng về khoảnh khắc này…"
              className={`${fieldClass} resize-none`}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-md border border-rose-300/30 px-3 py-2 text-sm text-rose-200"
            >
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-white/15 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onCancel}
            className={`${ghostButton} px-4 py-2 text-sm`}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className={`${ghostButton} px-5 py-2 text-sm`}
          >
            {isEdit ? "Lưu thay đổi" : "Thêm kỷ niệm"}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

export function MemoryForm({
  open,
  initial,
  onSubmit,
  onCancel,
}: MemoryFormProps): React.JSX.Element {
  return (
    <AnimatePresence>
      {open && (
        <FormDialog
          key={initial?.id ?? "new"}
          initial={initial}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      )}
    </AnimatePresence>
  );
}
