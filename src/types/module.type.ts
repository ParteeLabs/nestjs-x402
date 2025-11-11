import { FacilitatorConfig } from 'x402/types';
import { Recipient } from './x402.type';

export type X402ProviderOptions = {
  x402Version: number;
  recipients: Recipient[];
  resource: string;
  facilitator: FacilitatorConfig;
};

export type X402ModuleOptions = X402ProviderOptions & {
  global: boolean;
};

export type X402ModuleAsyncOptions = {
  global: boolean;
  imports?: any[];
  useFactory: (...args: any[]) => Promise<X402ProviderOptions> | X402ProviderOptions;
  inject?: any[];
};
