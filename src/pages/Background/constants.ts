export const SPEEDTEST_URL = 'https://www.speedtest.net/';
export const BROWSERBENCH_URL = 'https://xtzie.github.io/Speedometer/';
export const EXTENSION_ID = chrome.runtime.id;
export const CDP_VERSION = '1.3';
const DEFAULT_CATEGORIES = [
  '-*',
  'devtools.timeline',
  'v8.execute',
  'disabled-by-default-devtools.timeline',
  'disabled-by-default-devtools.timeline.frame',
  'toplevel',
  'blink.console',
  'blink.user_timing',
  'latencyInfo',
  'disabled-by-default-devtools.timeline.stack',
  'disabled-by-default-v8.cpu_profiler',
  'disabled-by-default-devtools.screenshot',
] as const;
export const EXCLUDED_CATEGORIES = DEFAULT_CATEGORIES.filter((cat) =>
  cat.startsWith('-')
).map((cat) => cat.slice(1));

export const INCLUDED_CATEGORIES = DEFAULT_CATEGORIES.filter(
  (cat) => !cat.startsWith('-')
);
