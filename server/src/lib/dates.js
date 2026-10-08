// All dates are handled in UTC; expense dates are stored as calendar dates.

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export const isValidMonth = (month) => MONTH_PATTERN.test(month);

/** Current month as "YYYY-MM". */
export const currentMonth = () => new Date().toISOString().slice(0, 7);

/** Returns the [start, end) UTC range for a "YYYY-MM" month. */
export const monthRange = (month) => {
  const [year, monthIndex] = month.split('-').map(Number);
  const start = new Date(Date.UTC(year, monthIndex - 1, 1));
  const end = new Date(Date.UTC(year, monthIndex, 1));
  return { start, end };
};

/** Parses a "YYYY-MM-DD" string into a UTC midnight Date. */
export const parseDateOnly = (value) => new Date(`${value}T00:00:00.000Z`);

/** Formats a Date as "YYYY-MM-DD". */
export const formatDateOnly = (date) => date.toISOString().slice(0, 10);
