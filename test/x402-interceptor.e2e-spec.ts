import { Test, TestingModule } from '@nestjs/testing';
import { Controller, Get, INestApplication, Post, Body, UseInterceptors } from '@nestjs/common';
import request from 'supertest';
import { X402Module, X402Interceptor, X402ApiOptions, X402DynamicPricing } from '../src';

// Mock the x402 library
jest.mock('x402/verify', () => ({
  useFacilitator: jest.fn(),
}));

jest.mock('x402/schemes', () => ({
  exact: {
    evm: {
      decodePayment: jest.fn(),
    },
  },
}));

// Mock facilitator for testing
const mockFacilitator = {
  verify: jest.fn(),
  settle: jest.fn(),
};

// Get the mocked functions
import { useFacilitator } from 'x402/verify';
import { exact } from 'x402/schemes';

(useFacilitator as jest.Mock).mockReturnValue(mockFacilitator);

// Test controller with X402 interceptor
@Controller('test')
@UseInterceptors(X402Interceptor)
class TestController {
  @Get('static-pricing')
  @X402ApiOptions({
    apiPrices: [
      { price: '$0.001', network: 'base' },
      { price: '0.0001 MATIC', network: 'polygon' },
    ],
    description: 'Test endpoint with static pricing',
    discoverable: true,
  })
  getStaticPricing() {
    return { message: 'Success with static pricing' };
  }

  @Get('dynamic-pricing')
  @X402ApiOptions({
    isDynamicPricing: true,
    description: 'Test endpoint with dynamic pricing',
  })
  getDynamicPricing() {
    // Simulate dynamic pricing scenario
    throw new X402DynamicPricing([
      { price: '$0.005', network: 'base' },
      { price: '0.0005 MATIC', network: 'polygon' },
    ]);
  }

  @Post('with-body')
  @X402ApiOptions({
    apiPrices: [{ price: '$0.002', network: 'base' }],
    inputSchema: {
      name: {
        type: 'string',
        description: 'User name',
      },
    },
    outputSchema: {
      result: {
        type: 'object',
        properties: {
          greeting: { type: 'string' },
        },
      },
    },
  })
  postWithBody(@Body() body: { name: string }) {
    return { greeting: `Hello, ${body.name}!` };
  }

  @Get('no-decorator')
  getNoDecorator() {
    return { message: 'This endpoint has no X402 protection' };
  }
}

// Test module
const createTestModule = async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [
      X402Module.register({
        global: true,
        x402Version: 1,
        resource: 'https://test-resource.com',
        recipients: [
          {
            payTo: '0x1234567890123456789012345678901234567890',
            network: 'base',
          },
          {
            payTo: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
            network: 'polygon',
          },
        ],
        facilitator: mockFacilitator as any,
      }),
    ],
    controllers: [TestController],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();

  return app;
};

describe('X402Interceptor (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Setup default mock for decodePayment - returns a valid payment object by default
    (exact.evm.decodePayment as jest.Mock).mockReturnValue({
      x402Version: 1,
      network: 'base',
      payer: '0x9876543210987654321098765432109876543210',
      amount: '1000',
      signature: 'mock-signature',
    });

    app = await createTestModule();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Static Pricing', () => {
    it('should return 402 when X-PAYMENT header is missing', () => {
      return request(app.getHttpServer())
        .get('/test/static-pricing')
        .expect(402)
        .expect((res) => {
          expect(res.body).toHaveProperty('x402Version', 1);
          expect(res.body).toHaveProperty('error', 'X-PAYMENT header is required');
          expect(res.body).toHaveProperty('accepts');
          expect(Array.isArray(res.body.accepts)).toBe(true);
          expect(res.body.accepts.length).toBeGreaterThan(0);
        });
    });

    it('should return 402 with payment requirements for static pricing', () => {
      return request(app.getHttpServer())
        .get('/test/static-pricing')
        .expect(402)
        .expect((res) => {
          const accepts = res.body.accepts;
          expect(accepts).toHaveLength(2);

          // Check first payment requirement (base network)
          expect(accepts[0]).toMatchObject({
            scheme: 'exact',
            network: 'base',
            resource: 'https://test-resource.com/test/static-pricing',
            payTo: '0x1234567890123456789012345678901234567890',
          });

          // Check second payment requirement (polygon network)
          expect(accepts[1]).toMatchObject({
            scheme: 'exact',
            network: 'polygon',
            resource: 'https://test-resource.com/test/static-pricing',
            payTo: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          });
        });
    });

    it('should return 402 when payment header is malformed', () => {
      // Mock decodePayment to throw an error for malformed payment
      (exact.evm.decodePayment as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid payment header');
      });

      return request(app.getHttpServer())
        .get('/test/static-pricing')
        .set('X-PAYMENT', 'invalid-payment-header')
        .expect(402)
        .expect((res) => {
          expect(res.body).toHaveProperty('error', 'Invalid or malformed payment header');
          expect(res.body).toHaveProperty('accepts');
        });
    });

    it('should allow request with valid payment and return response headers', async () => {
      const validPaymentHeader = 'valid-encoded-payment-data';
      const mockPayer = '0x9876543210987654321098765432109876543210';
      const mockSettleResponse = {
        paymentResponse: 'settlement-data',
      };

      // Mock successful verification
      mockFacilitator.verify.mockResolvedValue({
        isValid: true,
        payer: mockPayer,
      });

      // Mock successful settlement
      mockFacilitator.settle.mockResolvedValue(mockSettleResponse);

      const response = await request(app.getHttpServer())
        .get('/test/static-pricing')
        .set('X-PAYMENT', validPaymentHeader)
        .expect(200);

      expect(response.body).toEqual({ message: 'Success with static pricing' });
      expect(mockFacilitator.verify).toHaveBeenCalled();
      expect(mockFacilitator.settle).toHaveBeenCalled();
    });

    it('should return 402 when payment verification fails', async () => {
      const validPaymentHeader = 'valid-encoded-payment-data';
      const mockPayer = '0x9876543210987654321098765432109876543210';

      // Mock failed verification
      mockFacilitator.verify.mockResolvedValue({
        isValid: false,
        invalidReason: 'Insufficient funds',
        payer: mockPayer,
      });

      return request(app.getHttpServer())
        .get('/test/static-pricing')
        .set('X-PAYMENT', validPaymentHeader)
        .expect(402)
        .expect((res) => {
          expect(res.body).toHaveProperty('error', 'Insufficient funds');
          expect(res.body).toHaveProperty('payer', mockPayer);
        });
    });

    it('should return 402 when payment settlement fails', async () => {
      const validPaymentHeader = 'valid-encoded-payment-data';

      // Mock successful verification
      mockFacilitator.verify.mockResolvedValue({
        isValid: true,
      });

      // Mock failed settlement
      mockFacilitator.settle.mockRejectedValue(new Error('Settlement service unavailable'));

      return request(app.getHttpServer())
        .get('/test/static-pricing')
        .set('X-PAYMENT', validPaymentHeader)
        .expect(402)
        .expect((res) => {
          expect(res.body.error).toContain('Error settling payment');
          expect(res.body.error).toContain('Settlement service unavailable');
        });
    });
  });

  describe('Dynamic Pricing', () => {
    it('should return 402 with dynamic pricing when exception is thrown', () => {
      return request(app.getHttpServer())
        .get('/test/dynamic-pricing')
        .expect(402)
        .expect((res) => {
          expect(res.body).toHaveProperty('x402Version', 1);
          expect(res.body).toHaveProperty('error', 'Payment Required - Dynamic Pricing Applied');
          expect(res.body).toHaveProperty('accepts');
          expect(res.body.accepts).toHaveLength(2);

          // Verify dynamic prices are applied
          expect(res.body.accepts[0]).toMatchObject({
            scheme: 'exact',
            network: 'base',
          });
          expect(res.body.accepts[1]).toMatchObject({
            scheme: 'exact',
            network: 'polygon',
          });
        });
    });

    it('should include resource path in dynamic pricing response', () => {
      return request(app.getHttpServer())
        .get('/test/dynamic-pricing')
        .expect(402)
        .expect((res) => {
          const accepts = res.body.accepts;
          accepts.forEach((requirement: any) => {
            expect(requirement.resource).toBe('https://test-resource.com/test/dynamic-pricing');
          });
        });
    });
  });

  describe('POST Endpoint with Schema', () => {
    it('should return 402 for POST endpoint without payment', () => {
      return request(app.getHttpServer())
        .post('/test/with-body')
        .send({ name: 'John' })
        .expect(402)
        .expect((res) => {
          expect(res.body).toHaveProperty('accepts');
          const accepts = res.body.accepts;
          expect(accepts[0]).toMatchObject({
            scheme: 'exact',
            network: 'base',
            resource: 'https://test-resource.com/test/with-body',
          });

          // Check that input/output schema is included
          expect(accepts[0]).toHaveProperty('outputSchema');
          expect(accepts[0].outputSchema).toHaveProperty('inputSchema');
        });
    });

    it('should process POST request with valid payment', async () => {
      const validPaymentHeader = 'valid-encoded-payment-data';

      // Mock successful verification and settlement
      mockFacilitator.verify.mockResolvedValue({ isValid: true });
      mockFacilitator.settle.mockResolvedValue({ paymentResponse: 'settlement-data' });

      const response = await request(app.getHttpServer())
        .post('/test/with-body')
        .set('X-PAYMENT', validPaymentHeader)
        .send({ name: 'Alice' })
        .expect(201);

      expect(response.body).toEqual({ greeting: 'Hello, Alice!' });
    });
  });

  describe('Endpoint without X402 Decorator', () => {
    it('should allow access without X-PAYMENT header', () => {
      return request(app.getHttpServer())
        .get('/test/no-decorator')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({ message: 'This endpoint has no X402 protection' });
        });
    });

    it('should not trigger interceptor logic for unprotected endpoints', async () => {
      await request(app.getHttpServer()).get('/test/no-decorator').expect(200);

      // Facilitator should not be called for unprotected endpoints
      expect(mockFacilitator.verify).not.toHaveBeenCalled();
      expect(mockFacilitator.settle).not.toHaveBeenCalled();
    });
  });

  describe('Payment Requirements Structure', () => {
    it('should include all required fields in payment requirements', () => {
      return request(app.getHttpServer())
        .get('/test/static-pricing')
        .expect(402)
        .expect((res) => {
          const requirement = res.body.accepts[0];

          // Verify all required fields are present
          expect(requirement).toHaveProperty('scheme');
          expect(requirement).toHaveProperty('network');
          expect(requirement).toHaveProperty('maxAmountRequired');
          expect(requirement).toHaveProperty('resource');
          expect(requirement).toHaveProperty('description');
          expect(requirement).toHaveProperty('payTo');
          expect(requirement).toHaveProperty('maxTimeoutSeconds');
          expect(requirement).toHaveProperty('asset');
          expect(requirement).toHaveProperty('outputSchema');
        });
    });

    it('should include discoverable flag in input schema', () => {
      return request(app.getHttpServer())
        .get('/test/static-pricing')
        .expect(402)
        .expect((res) => {
          const requirement = res.body.accepts[0];
          expect(requirement.outputSchema.inputSchema.input).toHaveProperty('discoverable', true);
        });
    });
  });

  describe('Error Handling', () => {
    it('should handle verification errors gracefully', async () => {
      const validPaymentHeader = 'valid-encoded-payment-data';

      // Mock verification throwing an error
      mockFacilitator.verify.mockRejectedValue(new Error('Network timeout'));

      return request(app.getHttpServer())
        .get('/test/static-pricing')
        .set('X-PAYMENT', validPaymentHeader)
        .expect(402)
        .expect((res) => {
          expect(res.body.error).toContain('Error verifying payment');
          expect(res.body.error).toContain('Network timeout');
        });
    });

    it('should preserve non-X402 errors in dynamic pricing', async () => {
      // Create a controller that throws a different error
      @Controller('error-test')
      @UseInterceptors(X402Interceptor)
      class ErrorController {
        @Get('other-error')
        @X402ApiOptions({
          isDynamicPricing: true,
        })
        getOtherError() {
          throw new Error('Some other error');
        }
      }

      const errorModule = await Test.createTestingModule({
        imports: [
          X402Module.register({
            global: true,
            x402Version: 1,
            resource: 'https://test-resource.com',
            recipients: [{ payTo: '0x1234567890123456789012345678901234567890', network: 'base' }],
            facilitator: mockFacilitator as any,
          }),
        ],
        controllers: [ErrorController],
      }).compile();

      const errorApp = errorModule.createNestApplication();
      await errorApp.init();

      await request(errorApp.getHttpServer()).get('/error-test/other-error').expect(500);

      await errorApp.close();
    });
  });
});
