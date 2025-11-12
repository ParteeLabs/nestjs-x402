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

> Placeholder: Detailed usage instructions will be added here.

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
