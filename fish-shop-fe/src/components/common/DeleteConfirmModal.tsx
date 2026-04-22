"use client";

import React from "react";

type DeleteConfirmModalProps = {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  itemLabel?: string;
  isDeleting?: boolean;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
};

export default function DeleteConfirmModal({
  isOpen,
  title = "Xác nhận xóa",
  message,
  confirmLabel = "Xác nhận xóa",
  cancelLabel = "Hủy",
  itemLabel,
  isDeleting = false,
  onConfirm,
  onClose,
}: DeleteConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  const defaultMessage = itemLabel
    ? `Bạn có chắc chắn muốn xóa ${itemLabel}? Hành động này không thể hoàn tác.`
    : "Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác.";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <button
        aria-label="Đóng"
        className="absolute inset-0 bg-slate-900/55"
        onClick={onClose}
        type="button"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start gap-3">
          <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </div>
          <div>
            <h3 id="delete-modal-title" className="text-lg font-extrabold text-slate-900">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{message ?? defaultMessage}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isDeleting}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isDeleting}
          >
            {isDeleting ? "Đang xóa..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
