/**
 * Role-based section title mapping
 * Different roles see different section titles for better UX
 */
export const roleBasedTitles: Record<string, Record<string, string>> = {
  // Admin sees all sections with full names
  admin: {
    'doctor menu': 'DOCTOR MENU',
    'staff menu': 'STAFF MENU',
    'core management': 'CORE MANAGEMENT',
    'content management': 'CONTENT MANAGEMENT',
    'operations': 'OPERATIONS',
    'reports & settings': 'REPORTS & SETTINGS',
    'coming soon': 'COMING SOON',
    'role & permission management': 'ROLE & PERMISSION MANAGEMENT',
    'account': 'ACCOUNT',
    'auth pages': 'AUTH PAGES',
  },
  // Doctor sees simplified, role-focused titles
  doctor: {
    'doctor menu': 'MY WORK',
    'staff menu': 'RESOURCES',
    'core management': 'PATIENT MANAGEMENT',
    'content management': 'CONTENT',
    'operations': 'OPERATIONS',
    'reports & settings': 'REPORTS',
    'coming soon': 'COMING SOON',
    'role & permission management': 'ADMINISTRATION',
    'account': 'MY ACCOUNT',
    'auth pages': 'AUTH PAGES',
  },
  // Staff sees operational titles
  staff: {
    'doctor menu': 'MEDICAL',
    'staff menu': 'MY TASKS',
    'core management': 'MANAGEMENT',
    'content management': 'CONTENT',
    'operations': 'OPERATIONS',
    'reports & settings': 'SETTINGS',
    'coming soon': 'COMING SOON',
    'role & permission management': 'ADMIN',
    'account': 'ACCOUNT',
    'auth pages': 'AUTH PAGES',
  },
  // Patient sees patient-focused titles
  patient: {
    'doctor menu': 'MY HEALTH',
    'staff menu': 'SERVICES',
    'core management': 'APPOINTMENTS',
    'content management': 'INFORMATION',
    'operations': 'BILLING',
    'reports & settings': 'SETTINGS',
    'coming soon': 'COMING SOON',
    'role & permission management': 'ADMIN',
    'account': 'MY ACCOUNT',
    'auth pages': 'AUTH PAGES',
  },
};

/**
 * Get role-based title for a section
 * Falls back to original title if no mapping exists
 */
export function getRoleBasedTitle(originalTitle: string, userRole: string | null | undefined): string {
  if (!originalTitle) {
    return '';
  }

  if (!userRole) {
    // If no role, return uppercase version of original title
    return originalTitle.toUpperCase();
  }

  const roleLower = userRole.toLowerCase().trim();
  const titleLower = originalTitle.toLowerCase().trim();

  // Check if we have a mapping for this role
  if (roleBasedTitles[roleLower] && roleBasedTitles[roleLower][titleLower]) {
    return roleBasedTitles[roleLower][titleLower];
  }

  // Fallback: convert to uppercase (matching the CSS uppercase styling)
  return originalTitle.toUpperCase();
}

