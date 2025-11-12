import { FacilitatorConfig } from 'x402/types';
import { Recipient } from './x402.type';

export type X402ModuleOptions = {
  x402Version: number;
  recipients: Recipient[];
  resource: string;
  facilitator: FacilitatorConfig;
};

export type X402RegisterOptions = X402ModuleOptions & {
  global: boolean;
};

export type X402RegisterAsyncOptions = {
  global: boolean;
  imports?: any[];
  useFactory: (...args: any[]) => Promise<X402ModuleOptions> | X402ModuleOptions;
  inject?: any[];
};
