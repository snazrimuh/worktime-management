import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Injectable()
export class ScheduleAssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAssignmentDto) {
    // Check if user and schedule exist
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const schedule = await this.prisma.schedule.findUnique({ where: { id: dto.scheduleId } });
    if (!schedule) throw new NotFoundException('Schedule not found');

    return this.prisma.scheduleAssignment.create({
      data: {
        userId: dto.userId,
        scheduleId: dto.scheduleId,
        effectiveFrom: new Date(dto.effectiveFrom),
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
      },
      include: {
        user: { select: { name: true, email: true } },
        schedule: { select: { name: true, type: true } },
      },
    });
  }

  findAll() {
    return this.prisma.scheduleAssignment.findMany({
      include: {
        user: { select: { name: true, email: true } },
        schedule: { select: { name: true, type: true } },
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async findActiveForUser(userId: string, date: Date = new Date()) {
    return this.prisma.scheduleAssignment.findFirst({
      where: {
        userId,
        effectiveFrom: { lte: date },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: date } },
        ],
      },
      include: {
        schedule: true,
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.scheduleAssignment.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Assignment not found');

    return this.prisma.scheduleAssignment.delete({ where: { id } });
  }
}
