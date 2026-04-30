// ─────────────────────────────────────────────────────────────
//  Logger — lightweight test-run logger (console output)
// ─────────────────────────────────────────────────────────────

const PREFIX = '[nuqi-test]';

export const logger = {
  info(message: string, data?: Record<string, unknown>): void {
    const extra = data ? ` ${JSON.stringify(data)}` : '';
    console.info(`${PREFIX} INFO   ${message}${extra}`);
  },

  action(message: string): void {
    console.log(`${PREFIX} ACTION ${message}`);
  },

  warn(message: string): void {
    console.warn(`${PREFIX} WARN   ${message}`);
  },

  error(message: string, err?: unknown): void {
    const detail = err instanceof Error ? ` — ${err.message}` : '';
    console.error(`${PREFIX} ERROR  ${message}${detail}`);
  },
};
