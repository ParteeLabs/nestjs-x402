import type { Network, Price, x402Response } from 'x402/types';

export type PricingRequirement = {
  price: Price;
  network: Network;
};

export type Recipient = {
  payTo: string;
  network: Network;
};

export type X402Response = Omit<x402Response, 'error'> & {
  error?: string;
};
