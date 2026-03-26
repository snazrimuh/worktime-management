import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ScheduleType } from '@prisma/client';
import { ScheduleAssignmentsService } from '../assignments/assignments.service';

@Injectable()
export class SchedulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly assignmentsService: ScheduleAssignmentsService,
  ) {}

  async create(dto: CreateScheduleDto) {
    const existing = await this.prisma.schedule.findFirst({
      where: { name: dto.name },
    });
    if (existing) throw new ConflictException(`Schedule name "${dto.name}" already exists`);

    return this.prisma.schedule.create({
      data: {
        name: dto.name,
        type: dto.type as ScheduleType,
        startTime: dto.startTime,
        endTime: dto.endTime,
        minHours: dto.minHours,
        gracePeriodMinutes: dto.gracePeriodMinutes ?? 15,
        isActive: dto.isActive ?? true,
      },
    });
  }

  findAll() {
    return this.prisma.schedule.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  async update(id: string, dto: UpdateScheduleDto) {
    await this.findOne(id);
    return this.prisma.schedule.update({
      where: { id },
      data: {
        ...dto,
        type: dto.type as ScheduleType,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    // Check if there are active assignments? (Future proofing)
    return this.prisma.schedule.delete({ where: { id } });
  }

  async findTodayForUser(userId: string) {
    const assignment = await this.assignmentsService.findActiveForUser(userId);
    return assignment?.schedule || null;
  }
}
