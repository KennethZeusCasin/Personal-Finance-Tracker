export const useCurrency = () => {
  const formatCurrency = (amount: number | string | null | undefined) => {
    return `₱${Number(amount ?? 0).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  return {
    formatCurrency
  }
}