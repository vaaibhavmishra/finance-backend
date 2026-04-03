import type { Prisma } from '../generated/prisma/client';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import type {
  ListUsersQuery,
  UpdateRoleInput,
  UpdateStatusInput,
} from '../validators/user.validator';

/**
 * User Service — handles user management operations (admin only)
 */
export const UserService = {
  /**
   * List all users with filtering, pagination, and search
   */
  async listUsers(query: ListUsersQuery) {
    const { page, limit, role, status, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Execute count and find in parallel
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { records: { where: { isDeleted: false } } } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
    ]);

    const formattedUsers = users.map((user) => ({
      ...user,
      totalRecords: user._count.records,
      _count: undefined,
    }));

    return { users: formattedUsers, total };
  },

  /**
   * Get a single user by ID
   */
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { records: { where: { isDeleted: false } } } },
      },
    });

    if (!user) {
      throw ApiError.notFound('User');
    }

    return {
      ...user,
      totalRecords: user._count.records,
      _count: undefined,
    };
  },

  /**
   * Update a user's role
   */
  async updateRole(id: string, data: UpdateRoleInput, requesterId: string) {
    // Prevent self-role downgrade
    if (id === requesterId) {
      throw ApiError.badRequest('You cannot change your own role');
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw ApiError.notFound('User');
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role: data.role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    return updated;
  },

  /**
   * Update a user's status (activate/deactivate)
   */
  async updateStatus(id: string, data: UpdateStatusInput, requesterId: string) {
    // Prevent self-deactivation
    if (id === requesterId) {
      throw ApiError.badRequest('You cannot change your own status');
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw ApiError.notFound('User');
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status: data.status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    return updated;
  },

  /**
   * Delete a user (hard delete — cascades to records)
   */
  async deleteUser(id: string, requesterId: string) {
    // Prevent self-deletion
    if (id === requesterId) {
      throw ApiError.badRequest('You cannot delete your own account');
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw ApiError.notFound('User');
    }

    await prisma.user.delete({ where: { id } });
  },
};
