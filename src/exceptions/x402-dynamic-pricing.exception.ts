import type { PricingRequirement } from '../types/x402.type';

export class X402DynamicPricing {
  constructor(
    readonly dynamicPrices: PricingRequirement[],
    readonly message = 'Payment Required - Dynamic Pricing Applied'
  ) {}
}
