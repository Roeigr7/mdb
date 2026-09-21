import { describe, expect, it } from 'vitest';
import { isObserveEnabled } from './observe.js';

describe('isObserveEnabled', () => {
  it('is disabled when credentials are missing', () => {
    expect(isObserveEnabled({})).toBe(false);
    expect(
      isObserveEnabled({
        OBSERVE_APP_KEY: '  ',
        OBSERVE_APP_SECRET: 'secret',
      }),
    ).toBe(false);
  });

  it('is enabled when both credentials are present', () => {
    expect(
      isObserveEnabled({
        OBSERVE_APP_KEY: 'key',
        OBSERVE_APP_SECRET: 'secret',
      }),
    ).toBe(true);
  });
});
