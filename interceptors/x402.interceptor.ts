import { Injectable, type CallHandler, type ExecutionContext, type NestInterceptor } from '@nestjs/common';

/**
 * Interceptor for handling X402 responding logic.
 * Default/empty/x402Scan registering cases: Returns a 402 Payment Required response with default payment requirements.
 * Dynamic pricing case: Returns a 402 Payment Required response with overridden payment requirements.
 */
@Injectable()
export class X402Interceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    // TODO: Construct an default payment requirements.
    // TODO: Inject networks and payTo addresses.
    // Catch custom Prices and override default payment requirements.
    return next.handle();
  }
}
