import { Schemas } from '../types/router.type';

export function toQueryParams(schema: Schemas): Record<string, string> {
  return Object.entries(schema).reduce((acc, [key, value]) => {
    acc[key] = value.description || 'string parameter';
    return acc;
  }, {} as Record<string, string>);
}
