"use client";

interface TitleInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function TitleInput({ value, onChange }: TitleInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Title your week..."
      className="w-full bg-transparent text-[48px] font-bold leading-tight outline-none placeholder:text-text/20 md:text-[64px]"
    />
  );
}
