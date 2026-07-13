"use client";

import React, { useEffect } from "react";

type DetailModalProps = {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function DetailModal({ isOpen, title, subtitle, onClose, children }: DetailModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 detail-modal-backdrop-container">
      <button
        aria-label="Đóng"
        className="absolute inset-0 bg-slate-950/55 detail-modal-backdrop"
        onClick={onClose}
        type="button"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-modal-title"
        className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl detail-modal-content-container"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 detail-modal-header">
          <div>
            <h3 id="detail-modal-title" className="text-lg font-extrabold text-slate-900">
              {title}
            </h3>
            {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 no-print"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 detail-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
