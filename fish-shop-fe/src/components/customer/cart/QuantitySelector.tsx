"use client";

type QuantitySelectorProps = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
};

export default function QuantitySelector({ value, onChange, min = 1, max }: QuantitySelectorProps) {
  const handleDecrease = () => {
    const next = value - 1;
    if (next < min) {
      return;
    }
    onChange(next);
  };

  const handleIncrease = () => {
    const next = value + 1;
    if (max !== undefined && next > max) {
      return;
    }
    onChange(next);
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = Number(event.target.value);
    if (Number.isNaN(parsed)) {
      return;
    }

    const next = Math.max(min, max !== undefined ? Math.min(parsed, max) : parsed);
    onChange(next);
  };

  return (
    <div className="flex items-center bg-surface-container-highest rounded-full px-3 py-1 gap-3">
      <button className="hover:text-primary transition-colors" type="button" onClick={handleDecrease}>
        <span className="material-symbols-outlined text-lg leading-none">remove</span>
      </button>
      <input
        className="w-10 text-center bg-transparent text-primary font-bold outline-none"
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={handleInput}
      />
      <button className="hover:text-primary transition-colors" type="button" onClick={handleIncrease}>
        <span className="material-symbols-outlined text-lg leading-none">add</span>
      </button>
    </div>
  );
}
