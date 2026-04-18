export function makeK(n: number | null) {
  if (n === null) {
    return null;
  }
  if (n > 1000) {
    return (n / 1000).toFixed(1) + "k";
  }
  return n;
}

/** 태그 사이드바 등 — 길면 잘라서 표시 */
export function shortTag(tag: string | undefined | null, maxLen: number) {
  if (tag === undefined || tag === null) return "-";
  if (tag.length >= maxLen + 1) return tag.slice(0, maxLen) + "...";
  return tag;
}
