"use client";

interface WordCounterProps {
  count: number;
  target?: number;
}

export function WordCounter({ count, target = 100 }: WordCounterProps) {
  const met = count >= target;

  return (
    <span className={`text-sm ${met ? "text-accent" : "text-text/40"}`}>
      {count}/{target} words
    </span>
  );
}
