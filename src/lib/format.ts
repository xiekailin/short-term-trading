export function formatPrice(price: number): string {
  return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}K`;
  return vol.toString();
}

export function calcHV20(closes: number[]): string {
  if (closes.length < 2) return "—";
  const recent = closes.slice(-21);
  const logReturns: number[] = [];
  for (let i = 1; i < recent.length; i++) {
    if (recent[i - 1] > 0 && recent[i] > 0) {
      logReturns.push(Math.log(recent[i] / recent[i - 1]));
    }
  }
  if (logReturns.length < 2) return "—";
  const mean = logReturns.reduce((s, v) => s + v, 0) / logReturns.length;
  const variance = logReturns.reduce((s, v) => s + (v - mean) ** 2, 0) / (logReturns.length - 1);
  const annualized = Math.sqrt(variance) * Math.sqrt(252) * 100;
  return `${annualized.toFixed(1)}%`;
}

export function calcExpectedMove(price: number, atmIV: number, dte: number): string {
  if (!price || !atmIV || !dte) return "—";
  const move = price * atmIV * Math.sqrt(dte / 365);
  return `±$${move.toFixed(2)}`;
}

export function calcSpread(bid: number, ask: number): string {
  if (!bid || !ask) return "—";
  const mid = (bid + ask) / 2;
  const pct = ((ask - bid) / mid) * 100;
  return `${pct.toFixed(1)}%`;
}

export function calcDTE(expirationTimestamp: number): number {
  const diff = expirationTimestamp * 1000 - Date.now();
  return Math.max(1, Math.ceil(diff / 86400000));
}

export function formatExpDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
