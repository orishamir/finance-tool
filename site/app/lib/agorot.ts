// Shekels and agorot, one hundred agorot to the shekel. A record prices a conversion in shekels a dollar (`nis_per_usd`); a deal and the
// page write it in agorot a dollar. Each way rounds away the binary noise of the step (0.07 × 100 is 7.000000000000001 in floating point),
// so a figure read from a record shows and compares as the decimal it was written as.

/** Significant digits a converted figure keeps: far more than any price prints, far fewer than the noise sits below. */
const DIGITS = 12;

const decimal = (v: number): number => Number(v.toPrecision(DIGITS));

/** An amount in shekels, in agorot. */
export const agorotOfShekels = (shekels: number): number => decimal(shekels * 100);

/** An amount in agorot, in shekels. */
export const shekelsOfAgorot = (agorot: number): number => decimal(agorot / 100);
