import { Reflector } from '@nestjs/core';
import type { SchemaObject } from 'openapi3-ts/oas30';
import { Price } from 'x402/types';

export type X402ApiOptionsType = {
  apiPrices?: Price[];
  inputSchema?: Function | SchemaObject;
  outputSchema?: Function | SchemaObject;
};

export const X402ApiOptions = Reflector.createDecorator<X402ApiOptionsType>();
