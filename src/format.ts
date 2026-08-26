const COLOMBIA = 'es-CO';

const currency = new Intl.NumberFormat(COLOMBIA, {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const date = new Intl.DateTimeFormat(COLOMBIA, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function formatCurrency(value: number): string {
  return currency.format(value);
}

export function formatDate(isoDate: string): string {
  return date.format(new Date(isoDate));
}

export function formatRate(value: number): string {
  return `${value.toLocaleString(COLOMBIA, { maximumFractionDigits: 2 })} %`;
}

export function formatTerm(months: number): string {
  return months === 1 ? '1 mes' : `${months} meses`;
}
