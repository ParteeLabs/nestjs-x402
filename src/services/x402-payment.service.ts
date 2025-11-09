import { Inject, Injectable } from '@nestjs/common';

import { X402ApiOptionsType } from '../decorators/x402-options.decorator';

import type { X402ModuleOptions } from '../types/module.type';
import { PricingRequirement } from '../types/x402.type';

import { MODULE_OPTION_KEY } from '../constants/module-options.constant';

@Injectable()
export class X402PaymentService {
  constructor(@Inject(MODULE_OPTION_KEY) private readonly options: X402ModuleOptions) {}

  getExactPaymentRequirements(apiOptions: X402ApiOptionsType, dynamicPrices?: PricingRequirement[]) {
    const prices = dynamicPrices?.length ? dynamicPrices : apiOptions.apiPrices;
  }
}
