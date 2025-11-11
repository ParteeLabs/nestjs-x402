import { X402Response } from './x402.type';

export type VerifyPaymentResult = {
  valid: boolean;
  x402Response?: X402Response;
};
