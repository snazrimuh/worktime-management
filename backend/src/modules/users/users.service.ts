import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private get db(): any {
    return this.prisma as any;
  }

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        department: true,
        role: true,
        isSystemAdmin: true,
        createdAt: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        department: true,
        role: true,
        isSystemAdmin: true,
        createdAt: true,
      },
    });
  }

  findManagers() {
    return this.prisma.user.findMany({
      where: {
        OR: [{ role: 'MANAGER' }, { role: 'ADMIN' }, { isSystemAdmin: true }],
      },
      select: { id: true, name: true, email: true, role: true, department: true },
      orderBy: { name: 'asc' },
    });
  }

  findEmployees() {
    return this.prisma.user.findMany({
      where: {
        role: 'EMPLOYEE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async assignRole(id: string, role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE') {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: {
        role,
        isSystemAdmin: role === 'ADMIN' ? true : user.isSystemAdmin,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isSystemAdmin: true,
      },
    });
  }
}
