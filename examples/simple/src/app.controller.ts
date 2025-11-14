import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { X402ApiOptions, X402Interceptor } from 'nestjs-x402';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @X402ApiOptions({
    apiPrices: [{ price: '$0.001', network: 'base' }],
  })
  @UseInterceptors(X402Interceptor)
  getHello(): string {
    return this.appService.getHello();
  }
}
