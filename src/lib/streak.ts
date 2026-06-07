// Streak math (spec §4.6) — client mirror of the SQL get_user_stats, kept in lockstep
// so the UI can display/optimistically update without a round-trip. Computed against
// 'yyyy-MM-dd' local dates in the user's timezone (the caller resolves the tz).

export interface Streaks {
  current: number;
  max: number;
  total: number;
}

/** yyyy-MM-dd -> integer day index (UTC midnight based, tz already applied upstream). */
function dayNumber(localDate: string): number {
  const t = Date.parse(`${localDate}T00:00:00Z`);
  if (Number.isNaN(t)) throw new Error(`Invalid local date "${localDate}"`);
  return Math.floor(t / 86_400_000);
}

/**
 * @param localDates  the user's logged days as 'yyyy-MM-dd'
 * @param today       'yyyy-MM-dd' today in the user's tz
 */
export function computeStreaks(localDates: string[], today: string): Streaks {
  const todayNum = dayNumber(today);

  // distinct day numbers on or before today, ascending
  const nums = Array.from(
    new Set(localDates.map(dayNumber).filter((n) => n <= todayNum)),
  ).sort((a, b) => a - b);

  if (nums.length === 0) return { current: 0, max: 0, total: 0 };

  // gaps-and-islands: walk the sorted list, tracking run lengths
  let max = 1;
  let runLen = 1;
  let runEnd = nums[0]!;
  let currentRunLen = 0;

  const closeRun = () => {
    if (runEnd === todayNum || runEnd === todayNum - 1) currentRunLen = runLen;
  };

  for (let i = 1; i < nums.length; i++) {
    const prev = nums[i - 1]!;
    const cur = nums[i]!;
    if (cur === prev + 1) {
      runLen += 1;
    } else {
      closeRun();
      runLen = 1;
    }
    runEnd = cur;
    if (runLen > max) max = runLen;
  }
  closeRun(); // final run

  return { current: currentRunLen, max, total: nums.length };
}
