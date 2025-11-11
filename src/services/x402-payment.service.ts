import { Inject, Injectable, RequestMethod } from '@nestjs/common';
import { verify } from 'x402/verify';
import { exact } from 'x402/schemes';
import { findMatchingPaymentRequirements, processPriceToAtomicAmount } from 'x402/shared';
import { ERC20TokenAmount, HTTPRequestStructure, Network, PaymentPayload, PaymentRequirements } from 'x402/types';

import { X402ApiInferredOptionsType, X402ApiOptionsType } from '../decorators/x402-api-options.decorator';

import type { X402ModuleOptions } from '../types/module.type';
import { PricingRequirement } from '../types/x402.type';
import { VerifyPaymentResult } from '../types/payment-service.type';

import { MODULE_OPTION_KEY } from '../constants/module-options.constant';
import { VALID_METHODS } from '../constants/http.constant';

import { toQueryParams } from '../utils/schema.uitl';

@Injectable()
export class X402PaymentService {
  constructor(@Inject(MODULE_OPTION_KEY) private readonly config: X402ModuleOptions) {}

  getRecipientByNetwork(network: Network) {
    const recipient = this.config.recipients.find((recipient) => recipient.network === network);
    if (!recipient) {
      throw new Error(`No recipient found for network: ${network}`);
    }
    return recipient;
  }

  mergeToResponseSchema({
    method,
    discoverable,
    inputSchema,
    outputSchema,
  }: X402ApiOptionsType & X402ApiInferredOptionsType) {
    const input: HTTPRequestStructure & { discoverable: boolean } = {
      type: 'http',
      method: VALID_METHODS[method],
      discoverable: !!discoverable,
      bodyFields: inputSchema || {},
      bodyType: 'json',
    };
    if (inputSchema) {
      if ([RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH].includes(method)) {
        input.bodyFields = inputSchema;
        input.bodyType = 'json';
      } else {
        input.queryParams = toQueryParams(inputSchema);
      }
    }
    return {
      inputSchema: {
        input,
        output: outputSchema,
      },
    };
  }

  getExactPaymentRequirements(
    apiOptions: X402ApiOptionsType & X402ApiInferredOptionsType,
    dynamicPrices?: PricingRequirement[]
  ): PaymentRequirements[] {
    const { apiPrices, resourcePath, description = '' } = apiOptions;
    const prices = dynamicPrices?.length ? dynamicPrices : apiPrices || [];
    const accepts: PaymentRequirements[] = prices.map(({ price, network }) => {
      const atomicAmountForAsset = processPriceToAtomicAmount(price, network);
      if ('error' in atomicAmountForAsset) {
        throw new Error(atomicAmountForAsset.error);
      }
      const { maxAmountRequired, asset } = atomicAmountForAsset;
      return {
        scheme: 'exact',
        network,
        maxAmountRequired,
        resource: this.config.resource + resourcePath,
        description,
        mimeType: '',
        payTo: this.getRecipientByNetwork(network).payTo,
        maxTimeoutSeconds: 60,
        asset: asset.address,
        outputSchema: this.mergeToResponseSchema(apiOptions),
        extra: {
          name: (asset as ERC20TokenAmount['asset']).eip712?.name,
          version: (asset as ERC20TokenAmount['asset']).eip712?.version,
        },
      };
    });
    return accepts;
  }

  async verifyPayment(
    paymentRequirements: PaymentRequirements[],
    paymentHeader?: string
  ): Promise<VerifyPaymentResult> {
    if (!paymentHeader) {
      return {
        valid: false,
        x402Response: {
          x402Version: this.config.x402Version,
          error: 'X-PAYMENT header is required',
          accepts: paymentRequirements,
        },
      };
    }
    /// Decode payment header.
    let decodedPayment: PaymentPayload;
    try {
      decodedPayment = exact.evm.decodePayment(paymentHeader);
      decodedPayment.x402Version = this.config.x402Version;
    } catch (error) {
      return {
        valid: false,
        x402Response: {
          x402Version: this.config.x402Version,
          error: 'Invalid or malformed payment header',
          accepts: paymentRequirements,
        },
      };
    }
    /// Select available payment requirement and check for validity.
    try {
      const selectedPaymentRequirement =
        findMatchingPaymentRequirements(paymentRequirements, decodedPayment) || paymentRequirements[0];
      const response = await verify(decodedPayment, selectedPaymentRequirement);
      if (!response.isValid) {
        return {
          valid: false,
          x402Response: {
            x402Version: this.config.x402Version,
            error: response.invalidReason,
            payer: response.payer,
          },
        };
      }
    } catch (error) {
      return {
        valid: false,
        x402Response: {
          x402Version: this.config.x402Version,
          error: 'Error verifying payment: ' + (error as Error).message,
          accepts: paymentRequirements,
        },
      };
    }
    // All checks passed.
    return {
      valid: true,
    };
  }
}
