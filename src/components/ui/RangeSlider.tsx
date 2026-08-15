'use client';

interface RangeSliderProps {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
  step?: number;
  formatValue?: (value: number) => string;
  /** What the range measures, for the two thumbs' accessible names. */
  label?: string;
}

// Two native range inputs stacked on one track. Each input keeps
// pointer-events-none so a click on the track doesn't jump a thumb (native
// range behavior would fight having two overlapping inputs); only the thumb
// itself (targeted via the ::-webkit/-moz-range-thumb pseudo-elements) opts
// back into pointer-events so it stays draggable.
const THUMB = [
  '[&::-webkit-slider-thumb]:pointer-events-auto',
  '[&::-webkit-slider-thumb]:h-5',
  '[&::-webkit-slider-thumb]:w-5',
  '[&::-webkit-slider-thumb]:appearance-none',
  '[&::-webkit-slider-thumb]:rounded-full',
  '[&::-webkit-slider-thumb]:border-2',
  '[&::-webkit-slider-thumb]:border-[var(--color-surface)]',
  '[&::-webkit-slider-thumb]:bg-[var(--color-primary)]',
  '[&::-webkit-slider-thumb]:shadow-md',
  '[&::-webkit-slider-thumb]:cursor-pointer',
  '[&::-moz-range-thumb]:pointer-events-auto',
  '[&::-moz-range-thumb]:h-5',
  '[&::-moz-range-thumb]:w-5',
  '[&::-moz-range-thumb]:appearance-none',
  '[&::-moz-range-thumb]:rounded-full',
  '[&::-moz-range-thumb]:border-2',
  '[&::-moz-range-thumb]:border-[var(--color-surface)]',
  '[&::-moz-range-thumb]:bg-[var(--color-primary)]',
  '[&::-moz-range-thumb]:shadow-md',
  '[&::-moz-range-thumb]:cursor-pointer',
  '[&::-webkit-slider-runnable-track]:bg-transparent',
  '[&::-moz-range-track]:bg-transparent',
].join(' ');

export function RangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
  step = 1,
  formatValue,
  label: rangeLabel = 'age',
}: RangeSliderProps) {
  const percentMin = ((valueMin - min) / (max - min)) * 100;
  const percentMax = ((valueMax - min) / (max - min)) * 100;
  const label = formatValue ?? ((v: number) => String(v));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm font-medium text-[var(--color-text)]">
        <span>{label(valueMin)}</span>
        <span>{label(valueMax)}</span>
      </div>
      <div className="relative h-5">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-[var(--color-border)]" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[var(--color-primary)]"
          style={{ left: `${percentMin}%`, right: `${100 - percentMax}%` }}
        />
        <input
          type="range"
          aria-label={`Minimum ${rangeLabel}`}
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={(e) => onChange(Math.min(Number(e.target.value), valueMax - step), valueMax)}
          className={`pointer-events-none absolute inset-x-0 top-1/2 h-5 w-full -translate-y-1/2 appearance-none bg-transparent ${THUMB}`}
        />
        <input
          type="range"
          aria-label={`Maximum ${rangeLabel}`}
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={(e) => onChange(valueMin, Math.max(Number(e.target.value), valueMin + step))}
          className={`pointer-events-none absolute inset-x-0 top-1/2 h-5 w-full -translate-y-1/2 appearance-none bg-transparent ${THUMB}`}
        />
      </div>
    </div>
  );
}
