# NestJS x402 Integration

Seamlessly integrate the x402 payment processing system into your NestJS applications with this library. Designed for developers who want to leverage the power of x402 while maintaining the structure and scalability of NestJS.

## Installation

```bash
npm install nestjs-x402
```

## ⚠️ Warning

**This library is in early development and is not yet stable.**

- Breaking changes may occur frequently without notice
- APIs and interfaces are subject to change
- Not recommended for production use at this time
- Use at your own risk

We recommend waiting for a stable release before using this library in production applications.

## Usage

### Static pricing

When pricing is known at design time, decorate your route with `@X402ApiOptions` and provide `apiPrices`.
The `X402Interceptor` will generate exact payment requirements and require clients to include a valid `X-PAYMENT` header.

Example module registration (static):

```ts
// src/app.module.ts
import { X402Module } from 'nestjs-x402';
import { facilitator } from '@coinbase/x402';
...
@Module({
  imports: [
    X402Module.register({
      global: true, // optional: export providers globally
      x402Version: 1,
      resource: 'https://example.com/my-digital-resource',
      recipients: [{ payTo: '0x8bf15b7c1888d0082c045bdeeb038ccab78d5231', network: 'base' }],
      facilitator,
    }),
  ],
  ...
})
export class AppModule {}
```

Protect a route with static pricing:

```ts
// src/app.controller.ts
import { X402ApiOptions, X402Interceptor } from 'nestjs-x402';
...
@Controller()
export class AppController {
  @Get('greeting')
  @X402ApiOptions({
    apiPrices: [{ price: '$0.001', network: 'base' }],
    description: 'Get a warm greeting',
  })
  @UseInterceptors(X402Interceptor)
  getGreeting() {
    return { message: 'Hello — you paid!' };
  }
}
```

Notes:

- Clients must include an `X-PAYMENT` header (the signed x402 payment header). Without it the endpoint returns HTTP 402 and an `accepts` list describing valid payment requirements.
- You can apply the interceptor globally via `APP_INTERCEPTOR` if you prefer not to decorate every route. The interceptor will ignore route without the `@X402ApiOptions` decorator.

### Dynamic pricing

When the price depends on request details (quantity, content size, user tier, etc.), mark the route with `isDynamicPricing: true` and throw `X402DynamicPricing` from your handler with computed `PricingRequirement[]`.
The interceptor will catch it and return a 402 response containing the dynamic `accepts` list.

Example dynamic-pricing handler:

```ts
// src/dynamic.controller.ts
import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { X402ApiOptions, X402Interceptor, X402DynamicPricing } from 'nestjs-x402';
import type { PricingRequirement } from 'nestjs-x402';

@Controller('content')
export class ContentController {
  @Get('download')
  @X402ApiOptions({
    isDynamicPricing: true,
    description: 'Download content (dynamic price based on size)',
  })
  @UseInterceptors(X402Interceptor)
  async download(@Query('size') size: string) {
    const bytes = Number(size) || 0;
    const dynamicPrices: PricingRequirement[] = [
      {
        price: `$${(bytes / 1000000).toFixed(4)}`,
        network: 'base',
      },
    ];

    // Throw the dynamic pricing exception — interceptor converts this into a 402 response
    throw new X402DynamicPricing(dynamicPrices, 'Payment required for this download');
  }
}
```

Flow summary:

- Client requests the route without an `X-PAYMENT` header.
- Your handler computes prices and throws `X402DynamicPricing` with `PricingRequirement[]`.
- `X402Interceptor` returns HTTP 402 with `accepts` derived from the dynamic prices.
- Client builds a valid `X-PAYMENT` header (using x402 client libraries) and retries; interceptor validates and settles the payment, then the handler is allowed to proceed.

### Registering asynchronously

If your facilitator or recipients are loaded from a config service, use `registerAsync`:

```ts
X402Module.registerAsync({
  global: true,
  useFactory: async () => ({
    x402Version: 1,
    resource: process.env.X402_RESOURCE!,
    recipients: [{ payTo: process.env.PAYTO_BASE!, network: 'base' }],
    facilitator: /* your facilitator config */ {},
  }),
  inject: [],
});
```

### Try it locally (example project)

This repository includes a simple example under `examples/simple` you can run:

```bash
cd examples/simple
pnpm install    # or npm install
pnpm start:dev  # or npm run start:dev
```

Testing:

- Call the protected route without `X-PAYMENT` to receive HTTP 402 and the `accepts` list.
- Use the upstream `@coinbase/x402` or other x402 client tools to construct a valid `X-PAYMENT` header and call the endpoint again to complete the payment flow.

## Motivation

1. The x402 payment processing system is a powerful and flexible solution for handling payments in agent-based applications.
2. NestJS is a production-ready framework for backend development but lacks built-in support for x402.
3. Existing x402 support is limited to Express.js, leaving a gap for NestJS developers.
4. This library bridges that gap by providing decorators and utilities to integrate x402 seamlessly into NestJS applications.

## Development & Contributing

### Release Process

This project uses [Conventional Commits](https://conventionalcommits.org/) and [Semantic Release](https://semantic-release.gitbook.io/) for automated versioning and publishing.

#### Commit Message Format

- `feat: description` - New features (minor version bump)
- `fix: description` - Bug fixes (patch version bump)
- `feat!: description` or `BREAKING CHANGE:` - Breaking changes (major version bump)
- `docs: description` - Documentation changes
- `chore: description` - Maintenance tasks
- `ci: description` - CI/CD changes
- `test: description` - Test changes

#### Release Workflow

1. Commits to the `main` branch trigger the release workflow
2. Semantic-release analyzes commit messages to determine the version bump
3. Generates release notes and changelog
4. Publishes to npm with provenance
5. Creates a GitHub release

#### OIDC Configuration

This project uses **OpenID Connect (OIDC)** for secure publishing to npm - no tokens required!

**Setup Steps:**

1. **Repository**: Already configured ✅
2. **NPM Package**: If you own this package, enable GitHub Actions publishing:
   - Go to [npmjs.com](https://www.npmjs.com/package/nestjs-x402)
   - Settings → Publishing access → Enable "GitHub Actions"
   - Add repository: `ParteeLabs/nestjs-x402`

That's it! No secrets or variables needed.
