import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  RequestMethod,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { catchError, from, switchMap, Observable, throwError, of } from 'rxjs';

import { X402PaymentService } from '../services/x402-payment.service';
import { X402DynamicPricing } from '../exceptions/x402-dynamic-pricing.exception';
import { X402ApiOptions, X402ApiOptionsType } from '../decorators/x402-api-options.decorator';

import { X402ModuleOptions } from '../types/module.type';
import { X402Response } from '../types/x402.type';

import { MODULE_OPTION_KEY } from '../constants/module-options.constant';
/**
 * Interceptor for handling X402 responding logic.
 * Default/empty/x402Scan registering cases: Returns a 402 Payment Required response with default payment requirements.
 * Dynamic pricing case: Returns a 402 Payment Required response with overridden payment requirements.
 */
@Injectable()
export class X402Interceptor implements NestInterceptor {
  constructor(
    @Inject(Reflector.name)
    private readonly reflector: Reflector,
    @Inject(MODULE_OPTION_KEY)
    private readonly config: X402ModuleOptions,
    @Inject(X402PaymentService)
    private readonly paymentService: X402PaymentService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    /// Check for HTTP and Route options for X402.
    const t = context.getType();
    const apiOptions = this.reflector.get(X402ApiOptions, context.getHandler());
    if (t != 'http' || apiOptions === undefined) {
      return next.handle();
    }
    // TODO: Dynamic platform for Express or Fastify.
    const method: RequestMethod = this.reflector.get(METHOD_METADATA, context.getHandler());
    const routePath: string = this.reflector.get(PATH_METADATA, context.getHandler());
    const controllerPath: string = this.reflector.get(PATH_METADATA, context.getClass()) || '';

    const resourcePath = `/${controllerPath}/${routePath}`.replace(/\/+/g, '/');

    /// Dynamic pricing case: Handle dynamic pricing logic.
    if (apiOptions.isDynamicPricing) {
      return this.handleDynamicPricing(next, apiOptions, method, resourcePath);
    }
    /// Static pricing case: Validate the payment.
    return this.handleStaticPricing(context, next, apiOptions, method, resourcePath);
  }

  protected handleDynamicPricing(
    next: CallHandler,
    apiOptions: X402ApiOptionsType,
    method: RequestMethod,
    resourcePath: string
  ): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        if (err instanceof X402DynamicPricing) {
          const paymentRequirements = this.paymentService.getExactPaymentRequirements(
            {
              ...apiOptions,
              method,
              resourcePath,
            },
            err.dynamicPrices
          );
          const response: X402Response = {
            x402Version: this.config.x402Version,
            error: err.message,
            accepts: paymentRequirements,
          };
          throw new HttpException(response, HttpStatus.PAYMENT_REQUIRED);
        }
        return throwError(() => err);
      })
    );
  }

  protected handleStaticPricing(
    context: ExecutionContext,
    next: CallHandler,
    apiOptions: X402ApiOptionsType,
    method: RequestMethod,
    resourcePath: string
  ): Observable<any> {
    const paymentRequirements = this.paymentService.getExactPaymentRequirements({
      ...apiOptions,
      method,
      resourcePath,
    });
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();
    return from(
      this.paymentService.processPayment({
        paymentRequirements,
        paymentHeader: request.header('X-PAYMENT'),
      })
    ).pipe(
      switchMap(({ valid, x402Response, headers }) => {
        if (!valid) {
          response.statusCode = HttpStatus.PAYMENT_REQUIRED;
          return of(x402Response);
        }
        /// Set payment response headers.
        if (headers) {
          response.setHeaders(headers);
        }
        /// Payment is valid, proceed with the request.
        return next.handle();
      })
    );
  }
}
