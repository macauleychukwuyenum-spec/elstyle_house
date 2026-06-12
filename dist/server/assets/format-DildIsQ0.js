function formatNaira(amount) {
  const n = typeof amount === "string" ? Number(amount) : amount ?? 0;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(Number.isFinite(n) ? n : 0);
}
export {
  formatNaira as f
};
