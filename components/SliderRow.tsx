"use client";

// Renders the reusable SliderRow UI component used in review forms.
type SliderRowProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  leftLabel: string;
  rightLabel: string;
};

export default function SliderRow({
  label,
  value,
  onChange,
  leftLabel,
  rightLabel,
}: SliderRowProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-gray-700">{label}</div>

      <input
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#6155F5]"
      />

      <div className="flex justify-between text-[11px] text-gray-400">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
