'use client';

import React, { useState } from 'react';

interface CouponStatusToggleProps {
  id: number;
  isActive: boolean;
  onToggle: (id: number, isActive: boolean) => Promise<void>;
}

export default function CouponStatusToggle({ id, isActive, onToggle }: CouponStatusToggleProps) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    try {
      setLoading(true);
      await onToggle(id, !isActive);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        isActive ? 'bg-green-500' : 'bg-gray-300'
      } disabled:opacity-50`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isActive ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
