import type { SchemaObject } from 'openapi3-ts/oas30';

export function toQueryParams(schema: Record<string, SchemaObject>): Record<string, string> {
  return Object.entries(schema).reduce((acc, [key, value]) => {
    acc[key] = value.description || 'string parameter';
    return acc;
  }, {} as Record<string, string>);
}
