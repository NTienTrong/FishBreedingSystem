"use client";

import React from "react";

type LoginRequiredModalProps = {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export default function LoginRequiredModal({
  isOpen,
  title = "Bạn chưa đăng nhập",
  message = "Vui lòng đăng nhập để đặt hàng.",
  confirmLabel = "Đăng nhập",
  cancelLabel = "Hủy",
  onConfirm,
  onClose,
}: LoginRequiredModalProps) {
  if (!isOpen) {
    return null;
  }

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
        aria-labelledby="login-required-title"
        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start gap-3">
          <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[20px]">lock</span>
          </div>
          <div>
            <h3 id="login-required-title" className="text-lg font-extrabold text-slate-900">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-container"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
