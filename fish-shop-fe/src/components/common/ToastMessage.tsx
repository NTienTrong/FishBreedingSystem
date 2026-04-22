"use client";

import React from "react";

type ToastMessageProps = {
  show: boolean;
  message: string;
  variant?: "success" | "error";
};

export default function ToastMessage({ show, message, variant = "success" }: ToastMessageProps) {
  if (!show) {
    return null;
  }

  const isSuccess = variant === "success";

  return (
    <div className="fixed right-4 top-4 z-110 w-full max-w-sm animate-[fadeIn_0.2s_ease-out] rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <div className="flex items-start gap-3">
        <span
          className={`material-symbols-outlined text-[20px] ${
            isSuccess ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {isSuccess ? "check_circle" : "error"}
        </span>
        <p className="text-sm font-medium text-slate-700">{message}</p>
      </div>
    </div>
  );
}
