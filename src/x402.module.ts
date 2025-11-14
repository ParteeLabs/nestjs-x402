import { Module, type DynamicModule } from '@nestjs/common';

import type { X402ModuleOptions, X402RegisterAsyncOptions, X402RegisterOptions } from './types/module.type';

import { MODULE_OPTION_KEY } from './constants/module-options.constant';
import { X402PaymentService } from './services/x402-payment.service';
import { X402Interceptor } from './interceptors/x402.interceptor';

const DEFAULT_X402_MODULE_OPTIONS: Partial<X402ModuleOptions> = {
  x402Version: 1,
  recipients: [],
};

@Module({})
export class X402Module {
  static validateOptions({ recipients, resource }: X402ModuleOptions) {
    if (recipients?.length === 0) {
      throw new Error('At least one recipient must be specified in X402Module options.');
    }
    if (!resource) {
      throw new Error('A resource identifier must be specified in X402Module options.');
    }
  }

  static register(options: X402RegisterOptions): DynamicModule {
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
        X402PaymentService,
        X402Interceptor,
      ],
      exports: [MODULE_OPTION_KEY, X402PaymentService, X402Interceptor],
      global: options.global ?? false,
    };
  }

  static registerAsync({ global, useFactory, imports = [], inject }: X402RegisterAsyncOptions): DynamicModule {
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
            } as X402ModuleOptions;
            this.validateOptions(mergedOptions);
            return mergedOptions;
          },
          inject,
        },
        X402PaymentService,
        X402Interceptor,
      ],
      exports: [MODULE_OPTION_KEY, X402PaymentService, X402Interceptor],
      global: global ?? false,
    };
  }
}
