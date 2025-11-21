import {
  Controller,
  Get,
  HttpException,
  Query,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import {
  X402ApiOptions,
  X402DynamicPricing,
  X402Interceptor,
  X402PaymentService,
  X402ReqConfig,
  PricingRequirement,
  type X402ApiConfig,
} from 'nestjs-x402';
import type { Request as ExpressRequest } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly paymentService: X402PaymentService,
  ) {}

  @Get('/static')
  @X402ApiOptions({
    apiPrices: [{ price: '$0.001', network: 'base' }],
    description: 'Get a warm greeting from me!',
  })
  @UseInterceptors(X402Interceptor)
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/dynamic')
  @X402ApiOptions({
    description: 'Get a warm greeting from me!',
    isDynamicPricing: true,
    inputSchema: {
      number_of_greetings: {
        type: 'number',
        description: 'Number of greetings to receive',
        required: true,
      },
    },
  })
  @UseInterceptors(X402Interceptor)
  async getDynamicHello(
    @Request() req: ExpressRequest,
    @Query() { number_of_greetings = 1 },
    @X402ReqConfig() x402Config: X402ApiConfig,
  ) {
    const prices: PricingRequirement[] = [
      { price: `$${1 * Number(number_of_greetings)}`, network: 'base' },
    ];
    const paymentHeader = req.header('X-PAYMENT');
    if (!paymentHeader) {
      throw new X402DynamicPricing({ dynamicPrices: prices });
    }

    const paymentRequirements = this.paymentService.getExactPaymentRequirements(
      x402Config,
      prices,
    );
    const { valid, x402Response } = await this.paymentService.processPayment({
      paymentRequirements,
      paymentHeader,
    });
    if (!valid) {
      throw new HttpException(x402Response!, 402);
    }
  }
}
