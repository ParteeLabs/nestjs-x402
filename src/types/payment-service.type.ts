import { PaymentRequirements } from 'x402/types';
import { X402Response } from './x402.type';

export type ProcessPaymentInput = {
  paymentRequirements: PaymentRequirements[];
  paymentHeader?: string;
};

export type ProcessPaymentResult = {
  valid: boolean;
  x402Response?: X402Response;
  headers?: Map<string, string>;
};
