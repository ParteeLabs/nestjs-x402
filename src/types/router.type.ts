import { RequestMethod } from '@nestjs/common';
import type { SchemaObject } from 'openapi3-ts/oas30';

import { PricingRequirement } from './x402.type';

export type X402ApiConfig = {
  method: RequestMethod;
  resourcePath: string;
  apiPrices?: PricingRequirement[];
  isDynamicPricing?: boolean;
  description?: string;
  discoverable?: boolean;
  maxTimeoutSeconds?: number;
  mimeType?: string;
  inputSchema?: Record<string, SchemaObject>;
  outputSchema?: Record<string, SchemaObject>;
};
