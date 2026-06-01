import { ApiResponse, UserRole } from '@/types';
import { getUserByEmail, createUser, updateUserRole } from '@/models/User';
import { isAdmin } from '@/lib/rbac';

export const registerUser = async (
  email: string
): Promise<ApiResponse<{ id: string; email: string; role: UserRole }>> => {
  try {
    const existing = await getUserByEmail(email);

    if (existing) {
      return {
        success: false,
        error: 'User already exists',
        code: 'USER_EXISTS',
      };
    }

    const newUser = await createUser(email, 'user');

    if (!newUser) {
      return {
        success: false,
        error: 'Failed to create user',
        code: 'CREATION_FAILED',
      };
    }

    return {
      success: true,
      data: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    };
  }
};

export const promoteToOrganizer = async (
  userId: string,
  adminId: string,
  adminRole: UserRole
): Promise<ApiResponse<void>> => {
  try {
    if (!isAdmin(adminRole)) {
      return {
        success: false,
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
      };
    }

    const updated = await updateUserRole(userId, 'organizer');

    if (!updated) {
      return {
        success: false,
        error: 'Failed to update user role',
        code: 'UPDATE_FAILED',
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    };
  }
};

export const promoteToAdmin = async (
  userId: string,
  adminId: string,
  adminRole: UserRole
): Promise<ApiResponse<void>> => {
  try {
    if (!isAdmin(adminRole)) {
      return {
        success: false,
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
      };
    }

    const updated = await updateUserRole(userId, 'admin');

    if (!updated) {
      return {
        success: false,
        error: 'Failed to update user role',
        code: 'UPDATE_FAILED',
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    };
  }
};
