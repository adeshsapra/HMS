/**
 * Get role-based title for a section
 * Uses one professional title format consistently across roles.
 */
export function getRoleBasedTitle(originalTitle: string, userRole: string | null | undefined): string {
  if (!originalTitle) {
    return '';
  }

  // Kept for backward compatibility with callers that pass role.
  void userRole;
  return originalTitle;
}

