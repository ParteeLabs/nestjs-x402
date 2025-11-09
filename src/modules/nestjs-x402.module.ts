import type { DynamicModule } from '@nestjs/common';

// TODO: Implement dynamic module for inject x402 payment information, facilitator.
export class NestjsX402Module {
  static forRoot(options: any): DynamicModule {
    return {
      module: NestjsX402Module,
      providers: [
        {
          provide: 'X402_OPTIONS',
          useValue: options,
        },
      ],
      exports: ['X402_OPTIONS'],
    };
  }
  static forRootAsync(options: any): DynamicModule {
    return {
      module: NestjsX402Module,
      imports: options.imports || [],
      providers: [],
    };
  }
}
