import { Reflector } from '@nestjs/core';
import type { SchemaObject } from 'openapi3-ts/oas30';
import { Price } from 'x402/types';

export const X402_OPTIONS_DECORATOR = 'X402_OPTIONS_DECORATOR';

export type X402OptionsType = {
  defaultPrice?: Price;
  inputSchema?: Function | SchemaObject;
  outputSchema?: Function | SchemaObject;
};

export const X402Options = Reflector.createDecorator<X402OptionsType>({
  key: X402_OPTIONS_DECORATOR,
});
