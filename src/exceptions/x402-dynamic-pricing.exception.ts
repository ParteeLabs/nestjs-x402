import type { PricingRequirement } from '../types/x402.type';

export class X402DynamicPricing extends Error {
  readonly dynamicPrices: PricingRequirement[];
  constructor({
    dynamicPrices,
    message = 'Payment Required - Dynamic Pricing Applied',
  }: {
    dynamicPrices: PricingRequirement[];
    message?: string;
  }) {
    super(message);
    this.dynamicPrices = dynamicPrices;
  }
}
