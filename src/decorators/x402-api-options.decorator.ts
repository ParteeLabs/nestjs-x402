import { RequestMethod } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { SchemaObject } from 'openapi3-ts/oas30';

import type { PricingRequirement } from '../types/x402.type';

export type X402ApiOptionsType = {
  apiPrices?: PricingRequirement[];
  isDynamicPricing?: boolean;
  description?: string;
  discoverable?: boolean;
  maxTimeoutSeconds?: number;
  mimeType?: string;
  inputSchema?: Record<string, SchemaObject>;
  outputSchema?: Record<string, SchemaObject>;
};

export const DEFAULT_API_OPTIONS: Partial<X402ApiOptionsType> = {
  isDynamicPricing: false,
  maxTimeoutSeconds: 60,
  discoverable: false,
  mimeType: 'application/json',
};

function apiOptionsWithDefault(options: Partial<X402ApiOptionsType>): X402ApiOptionsType {
  return {
    ...DEFAULT_API_OPTIONS,
    ...options,
  };
}

export const X402ApiOptions = Reflector.createDecorator<X402ApiOptionsType>({ transform: apiOptionsWithDefault });

export type X402ApiInferredOptionsType = {
  method: RequestMethod;
  resourcePath: string;
};
