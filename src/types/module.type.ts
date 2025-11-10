import { Recipient } from './x402.type';

export type X402ModuleOptions = {
  global: boolean;
  recipients: Recipient[];
  resource: string;
};

export type X402ModuleAsyncOptions = {
  global: boolean;
  imports?: any[];
  useFactory: (...args: any[]) => Promise<Omit<X402ModuleOptions, 'global'>> | Omit<X402ModuleOptions, 'global'>;
  inject?: any[];
};
