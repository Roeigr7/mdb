type ThrottleRule = { limit: number; ttl: number };

/**
 * Same metadata keys as @nestjs/throttler, without importing that package.
 * The package is CommonJS and breaks Vercel's ESM Nest runtime.
 */
export function Throttle(
  options: Record<string, ThrottleRule>,
): MethodDecorator {
  return (_target, _propertyKey, descriptor) => {
    if (!descriptor || typeof descriptor.value !== 'function') {
      return descriptor;
    }

    for (const name of Object.keys(options)) {
      const rule = options[name];
      Reflect.defineMetadata(`THROTTLER:TTL${name}`, rule.ttl, descriptor.value);
      Reflect.defineMetadata(
        `THROTTLER:LIMIT${name}`,
        rule.limit,
        descriptor.value,
      );
    }

    return descriptor;
  };
}
