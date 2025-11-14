import { Module } from '@nestjs/common';
import { X402Module } from 'nestjs-x402';
import { facilitator } from '@coinbase/x402';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    X402Module.register({
      global: true,
      x402Version: 1,
      resource: 'https://example.com/my-digital-resource',
      recipients: [
        {
          payTo: '0x7474747474747474747474747474747474747474',
          network: 'base',
        },
      ],
      facilitator,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
