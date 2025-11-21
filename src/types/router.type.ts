import { RequestMethod } from '@nestjs/common';
import type { SchemaObject } from 'openapi3-ts/oas31';

import { PricingRequirement } from './x402.type';

export type Schema = Pick<
  SchemaObject,
  | 'type'
  | 'format'
  | 'properties'
  | 'default'
  | 'items'
  | 'maxItems'
  | 'minItems'
  | 'enum'
  | 'pattern'
  | 'description'
  | 'example'
  | 'examples'
> & {
  required?: boolean;
};

export type Schemas = Record<string, Schema>;

export type X402ApiConfig = {
  method: RequestMethod;
  resourcePath: string;
  apiPrices?: PricingRequirement[];
  isDynamicPricing: boolean;
  description?: string;
  discoverable: boolean;
  maxTimeoutSeconds: number;
  mimeType: string;
  inputSchema?: Schemas;
  outputSchema?: Schemas;
};
