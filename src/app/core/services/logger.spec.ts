import { Logger } from './logger';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/environments/environment', () => ({
  environment: { production: false },
}));

describe('AppLogger', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes structured entries with event metadata', () => {
    const consoleInfo = vi.spyOn(console, 'info').mockImplementation(() => {});
    const logger = new Logger();

    logger.info('room.create.succeeded', { source: 'firestore' });

    const [entry] = consoleInfo.mock.calls[0];
    expect(entry).toEqual(
      expect.objectContaining({
        level: 'info',
        event: 'room.create.succeeded',
        source: 'firestore',
        timestamp: expect.any(String),
      }),
    );
  });

  it('logs a safe error code without exposing the original error message', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const logger = new Logger();

    logger.error('room.create.failed', {
      code: 'permission-denied',
      message: 'private detail',
    });

    const [entry] = consoleError.mock.calls[0];
    expect(entry).toEqual(
      expect.objectContaining({
        level: 'error',
        event: 'room.create.failed',
        errorCode: 'permission-denied',
      }),
    );
    expect(JSON.stringify(entry)).not.toContain('private detail');
  });
});
