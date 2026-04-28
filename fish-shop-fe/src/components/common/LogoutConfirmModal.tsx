"use client";

import React, { useEffect } from "react";

type LogoutConfirmModalProps = {
  isOpen: boolean;
  isSubmitting?: boolean;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
  title?: string;
  description?: string;
  hint?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export default function LogoutConfirmModal({
  isOpen,
  isSubmitting = false,
  onConfirm,
  onClose,
  title,
  description,
  hint,
  confirmLabel,
  cancelLabel,
}: LogoutConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) {
    return null;
  }

  const titleText = title ?? "Xác nhận đăng xuất";
  const descriptionText = description
    ?? "Bạn đang đăng nhập với vai trò ADMIN. Nếu đăng xuất, phiên hiện tại sẽ kết thúc ngay.";
  const hintText = hint
    ?? "Mẹo: Nếu chỉ muốn quay về trang chủ, bạn vẫn có thể giữ phiên đăng nhập và đóng tab sau.";
  const confirmText = confirmLabel ?? "Đăng xuất";
  const cancelText = cancelLabel ?? "Hủy";

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center px-4">
      <button
        aria-label="Đóng"
        className="absolute inset-0 bg-slate-950/55"
        onClick={onClose}
        type="button"
        disabled={isSubmitting}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="h-1.5 w-full bg-linear-to-r from-primary via-secondary to-tertiary" />

        <div className="p-6">
          <div className="mb-5 flex items-start gap-4">
            <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <span className="material-symbols-outlined text-[22px]">logout</span>
            </div>
            <div>
              <h3 id="logout-modal-title" className="text-lg font-extrabold text-slate-900">
                {titleText}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {descriptionText}
              </p>
            </div>
          </div>

          {hintText ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              {hintText}
            </div>
          ) : null}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-full bg-linear-to-r from-primary to-primary-container px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang đăng xuất..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
