const lkrFormatter = new Intl.NumberFormat('en-LK', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export const formatLkr = (value: number | string | null | undefined) => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) {
    return 'Rs. 0.00';
  }

  return `Rs. ${lkrFormatter.format(numeric)}`;
};
