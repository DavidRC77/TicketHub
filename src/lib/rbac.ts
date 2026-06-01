import { UserRole } from '@/types';

export const ROLES: Record<UserRole, number> = {
  admin: 3,
  organizer: 2,
  user: 1,
};

export const canAccess = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return ROLES[userRole] >= ROLES[requiredRole];
};

export const isAdmin = (role: UserRole): boolean => role === 'admin';

export const isOrganizer = (role: UserRole): boolean => role === 'organizer' || role === 'admin';

export const isUser = (role: UserRole): boolean => role === 'user' || role === 'organizer' || role === 'admin';

export const getRolePermissions = (role: UserRole): string[] => {
  const permissions: Record<UserRole, string[]> = {
    admin: [
      'manage_users',
      'manage_organizers',
      'manage_events',
      'manage_tickets',
      'view_analytics',
      'manage_settings',
    ],
    organizer: [
      'create_events',
      'manage_own_events',
      'view_own_tickets',
      'view_event_analytics',
    ],
    user: [
      'view_events',
      'purchase_tickets',
      'manage_own_tickets',
    ],
  };

  return permissions[role] || [];
};
