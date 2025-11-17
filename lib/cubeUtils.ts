// lib/cubeUtils.ts
export function decodeSymbol(sym?: string | null) {
  if (!sym) return "";
  if (!sym.startsWith("0x")) return sym;
  const hex = sym.slice(2);
  let out = "";
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16);
    if (byte === 0) break;
    out += String.fromCharCode(byte);
  }
  return out;
}

export function prestigeLabel(level: number) {
  if (level === 0) return "Unprestiged";
  return `Prestige ${level}`;
}
