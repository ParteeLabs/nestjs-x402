import type { Network, Price } from 'x402/types';

export type PricingRequirement = {
  price: Price;
  network: Network;
};

export type Recipient = {
  payTo: string;
  network: Network;
};
