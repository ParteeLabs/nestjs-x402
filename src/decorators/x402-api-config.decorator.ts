import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { X402ApiConfig } from '../types/router.type';

const key = '__x402ApiConfig';

export function attachApiConfig(req: any, config: X402ApiConfig) {
  req[key] = config;
}

export const X402ReqConfig = createParamDecorator((_: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  return request[key] as X402ApiConfig;
});
