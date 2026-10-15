import dayjs from 'dayjs';

/** Current month as "YYYY-MM". */
export const currentMonth = () => dayjs().format('YYYY-MM');

/** Moves a "YYYY-MM" month forward (positive) or backward (negative). */
export const shiftMonth = (month: string, delta: number) => dayjs(`${month}-01`).add(delta, 'month').format('YYYY-MM');

/** First and last calendar day of a month, as "YYYY-MM-DD". */
export const monthBounds = (month: string) => {
  const start = dayjs(`${month}-01`);
  return { startDate: start.format('YYYY-MM-DD'), endDate: start.endOf('month').format('YYYY-MM-DD') };
};

export const today = () => dayjs().format('YYYY-MM-DD');
