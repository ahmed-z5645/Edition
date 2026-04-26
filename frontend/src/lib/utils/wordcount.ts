export function countWords(text: string): number {
  const stripped = text
    .replace(/[#*_~`>\[\]()!|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!stripped) return 0;
  return stripped.split(" ").length;
}
