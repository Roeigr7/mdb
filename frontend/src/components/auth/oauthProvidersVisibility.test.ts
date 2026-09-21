import { describe, expect, it } from 'vitest';
import { resolveOAuthButtonVisibility } from './oauthProvidersVisibility';

describe('resolveOAuthButtonVisibility', () => {
  it('hides all buttons while providers are loading', () => {
    expect(resolveOAuthButtonVisibility(undefined, 'pending')).toEqual({
      showGoogle: false,
      showFacebook: false,
    });
  });

  it('hides all buttons when the providers request fails', () => {
    expect(
      resolveOAuthButtonVisibility(
        { google: true, facebook: true },
        'error',
      ),
    ).toEqual({
      showGoogle: false,
      showFacebook: false,
    });
  });

  it('hides all buttons when neither provider is configured', () => {
    expect(
      resolveOAuthButtonVisibility(
        { google: false, facebook: false },
        'success',
      ),
    ).toEqual({
      showGoogle: false,
      showFacebook: false,
    });
  });

  it('shows only Google when Google is enabled', () => {
    expect(
      resolveOAuthButtonVisibility(
        { google: true, facebook: false },
        'success',
      ),
    ).toEqual({
      showGoogle: true,
      showFacebook: false,
    });
  });

  it('shows only Facebook when Facebook is enabled', () => {
    expect(
      resolveOAuthButtonVisibility(
        { google: false, facebook: true },
        'success',
      ),
    ).toEqual({
      showGoogle: false,
      showFacebook: true,
    });
  });

  it('shows both buttons when both providers are enabled', () => {
    expect(
      resolveOAuthButtonVisibility(
        { google: true, facebook: true },
        'success',
      ),
    ).toEqual({
      showGoogle: true,
      showFacebook: true,
    });
  });
});
