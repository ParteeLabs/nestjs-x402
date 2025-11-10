import { RequestMethod } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { SchemaObject } from 'openapi3-ts/oas30';

import { PricingRequirement } from '../types/x402.type';

export type X402ApiOptionsType = {
  apiPrices?: PricingRequirement[];
  description?: string;
  discoverable?: boolean;
  maxTimeoutSeconds?: number;
  mimeType?: string;
  inputSchema?: Record<string, SchemaObject>;
  outputSchema?: Record<string, SchemaObject>;
};

export type X402ApiInferredOptionsType = {
  method: RequestMethod;
  resourcePath: string;
  m: RequestMethod;
};

export const X402ApiOptions = Reflector.createDecorator<X402ApiOptionsType>();
