/**
 * Shared Showcase visibility rules. The API, local store, and client all use
 * the same case-insensitive interpretation of the Private status.
 */

export function isPrivateShowcaseStatus(status: unknown): boolean {
  return typeof status === 'string' && status.trim().toLowerCase() === 'private';
}

export function isPublicShowcaseProject(project: {
  published?: boolean;
  status?: unknown;
}): boolean {
  // `published` is optional for compatibility with older schemas. Only an
  // explicit false or a Private status (any casing/whitespace) hides a row.
  return project.published !== false && !isPrivateShowcaseStatus(project.status);
}
