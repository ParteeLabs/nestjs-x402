# Commit Message Convention

This project follows [Conventional Commits](https://conventionalcommits.org/) specification.

## Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation

## Breaking Changes

Any commit that includes a breaking change should include:

- `!` after the type/scope
- OR `BREAKING CHANGE:` in the footer

## Examples

```
feat: add x402 payment validation decorator
fix: resolve interceptor timing issue
docs: update installation instructions
feat!: change payment service interface
```

## Automated Release

When commits are pushed to the `main` branch:

- **feat**: triggers a minor version bump (0.1.0 → 0.2.0)
- **fix**: triggers a patch version bump (0.1.0 → 0.1.1)
- **feat!** or **BREAKING CHANGE**: triggers a major version bump (0.1.0 → 1.0.0)
