import { Reflector } from '@nestjs/core';

import { X402ApiConfig } from '../types/router.type';

export type X402ApiOptionsConfig = Omit<X402ApiConfig, 'method' | 'resourcePath'>;

export const DEFAULT_API_OPTIONS: X402ApiOptionsConfig = {
  isDynamicPricing: false,
  maxTimeoutSeconds: 60,
  discoverable: false,
  mimeType: 'application/json',
};

function apiOptionsWithDefault(options: Partial<X402ApiOptionsConfig>): X402ApiOptionsConfig {
  return {
    ...DEFAULT_API_OPTIONS,
    ...options,
  };
}

export const X402ApiOptions = Reflector.createDecorator<Partial<X402ApiOptionsConfig>, X402ApiOptionsConfig>({
  transform: apiOptionsWithDefault,
});
