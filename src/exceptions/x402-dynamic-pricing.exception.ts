import type { PricingRequirement } from '../types/x402.type';

export class X402DynamicPricing extends Error {
  constructor(readonly dynamicPrices: PricingRequirement[], message = 'Payment Required - Dynamic Pricing Applied') {
    super(message);
  }
}
