/** djb2 hash — extremely fast, low collision rate for short strings */
export function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0; // keep as unsigned 32-bit
  }
  return hash;
}

export function hashString(str: string): string {
  return djb2(str).toString(36);
}
