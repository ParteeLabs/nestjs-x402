import { Injectable, type CallHandler, type ExecutionContext, type NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { X402PaymentService } from '../services/x402-payment.service';

import { X402ApiOptions } from '../decorators/x402-options.decorator';
import { X402Error } from '../errors/x402.error';

/**
 * Interceptor for handling X402 responding logic.
 * Default/empty/x402Scan registering cases: Returns a 402 Payment Required response with default payment requirements.
 * Dynamic pricing case: Returns a 402 Payment Required response with overridden payment requirements.
 */
@Injectable()
export class X402Interceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector, private readonly paymentService: X402PaymentService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>> {
    const t = context.getType();
    const x402Options = this.reflector.get(X402ApiOptions, context.getHandler());
    if (t != 'http' || x402Options === undefined) {
      return next.handle();
    }
    // TODO: Generate API static pricing logic here.
    // TODO: Generate API dynamic pricing logic here.
    try {
      return next.handle();
    } catch (err) {
      if (err instanceof X402Error && x402Options !== undefined) {
        throw err;
      } else {
        throw err;
      }
    }
  }
}
