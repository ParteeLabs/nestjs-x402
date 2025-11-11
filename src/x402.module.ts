import type { DynamicModule } from '@nestjs/common';

import type { X402ModuleAsyncOptions, X402ModuleOptions, X402ProviderOptions } from './types/module.type';

import { MODULE_OPTION_KEY } from './constants/module-options.constant';

const DEFAULT_X402_MODULE_OPTIONS: Partial<X402ProviderOptions> = {
  x402Version: 1,
  recipients: [],
};

export class X402Module {
  static validateOptions({ recipients, resource }: X402ProviderOptions) {
    if (recipients?.length === 0) {
      throw new Error('At least one recipient must be specified in X402Module options.');
    }
    if (!resource) {
      throw new Error('A resource identifier must be specified in X402Module options.');
    }
  }

  static forRoot(options: X402ModuleOptions): DynamicModule {
    const mergedOptions = {
      ...DEFAULT_X402_MODULE_OPTIONS,
      ...options,
    };
    this.validateOptions(mergedOptions);

    return {
      module: X402Module,
      providers: [
        {
          provide: MODULE_OPTION_KEY,
          useValue: mergedOptions,
        },
      ],
      exports: [MODULE_OPTION_KEY],
      global: options.global ?? false,
    };
  }

  static forRootAsync({ global, useFactory, imports = [], inject }: X402ModuleAsyncOptions): DynamicModule {
    return {
      module: X402Module,
      imports,
      providers: [
        {
          provide: MODULE_OPTION_KEY,
          useFactory: (...args: any[]) => {
            const options = useFactory(...args);
            const mergedOptions = {
              ...DEFAULT_X402_MODULE_OPTIONS,
              ...options,
            } as X402ProviderOptions;
            this.validateOptions(mergedOptions);
            return mergedOptions;
          },
          inject,
        },
      ],
      exports: [MODULE_OPTION_KEY],
      global: global ?? false,
    };
  }
}
