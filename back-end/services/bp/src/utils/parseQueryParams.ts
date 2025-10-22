/**
 * Safely parse a query parameter as an integer.
 *
 * @param value The query parameter value (can be string, array, or ParsedQs)
 * @param defaultValue The default value to return if parsing fails
 * @returns The parsed integer or default value
 */
export function parseQueryInt(value: unknown, defaultValue: number): number {
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}
