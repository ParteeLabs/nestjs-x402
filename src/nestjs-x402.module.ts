import type { DynamicModule } from '@nestjs/common';

import type { X402ModuleAsyncOptions, X402ModuleOptions } from './types/module.type';

import { MODULE_OPTION_KEY } from './constants/module-options.constant';

export class NestjsX402Module {
  static forRoot(options: X402ModuleOptions): DynamicModule {
    return {
      module: NestjsX402Module,
      providers: [
        {
          provide: MODULE_OPTION_KEY,
          useValue: options,
        },
      ],
      exports: [MODULE_OPTION_KEY],
      global: options.global ?? false,
    };
  }
  static forRootAsync({ global, useFactory, imports = [], inject }: X402ModuleAsyncOptions): DynamicModule {
    return {
      module: NestjsX402Module,
      imports,
      providers: [
        {
          provide: MODULE_OPTION_KEY,
          useFactory,
          inject,
        },
      ],
      exports: [MODULE_OPTION_KEY],
      global: global ?? false,
    };
  }
}
