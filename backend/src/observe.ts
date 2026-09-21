import { createObserveModule } from '@nestjs/observe';

/**
 * Nest Observe is optional for local/dev.
 * Enable only when real credentials are present in the environment.
 * Sign up at https://observe.nestjs.com — do not invent keys.
 */
export function isObserveEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const appKey = env.OBSERVE_APP_KEY?.trim();
  const appSecret = env.OBSERVE_APP_SECRET?.trim();
  return Boolean(appKey && appSecret);
}

export const { ObserveModule, ObserveInstrument } = createObserveModule();
