export type X402ModuleOptions = {
  global: boolean;
};

export type X402ModuleAsyncOptions = {
  global: boolean;
  imports?: any[];
  useFactory: (...args: any[]) => Promise<Omit<X402ModuleOptions, 'global'>> | Omit<X402ModuleOptions, 'global'>;
  inject?: any[];
};
