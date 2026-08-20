/** Applies a space's promotional discount to a base (full) hourly price. */
export function precoComDesconto(precoBase: number, descontoPercentual: number): number {
  return Math.round(precoBase * (1 - descontoPercentual / 100) * 100) / 100;
}
