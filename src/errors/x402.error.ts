import { PricingRequirement } from '../types/x402.type';

export class X402Error extends Error {
  dynamicPrices?: PricingRequirement[];
  constructor(dynamicPrices?: PricingRequirement[]) {
    super('Payment Required');
    this.dynamicPrices = dynamicPrices;
  }
}
