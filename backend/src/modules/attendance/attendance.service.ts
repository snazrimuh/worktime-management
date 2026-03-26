import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScheduleAssignmentsService } from '../assignments/assignments.service';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly assignmentsService: ScheduleAssignmentsService,
  ) {}

  async checkIn(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Double check if already checked in
    const existing = await this.prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
    });
    if (existing?.checkIn) throw new BadRequestException('Already checked in for today');

    // Find active schedule
    const assignment = await this.assignmentsService.findActiveForUser(userId);
    if (!assignment) throw new BadRequestException('No active schedule assigned to you');

    const schedule = assignment.schedule;
    const now = new Date();
    let status: AttendanceStatus = 'ON_TIME';

    if (schedule.type !== 'FLEXI' && schedule.startTime) {
      // Logic for LATE detection
      const [schedH, schedM] = schedule.startTime.split(':').map(Number);
      const scheduledTime = new Date(now);
      scheduledTime.setHours(schedH, schedM, 0, 0);

      const diffMs = now.getTime() - scheduledTime.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));

      if (diffMins > (schedule.gracePeriodMinutes || 15)) {
        status = 'LATE';
      }
    }

    return this.prisma.attendance.upsert({
      where: { userId_date: { userId, date: today } },
      update: { checkIn: now, status, scheduleId: schedule.id },
      create: {
        userId,
        date: today,
        checkIn: now,
        status,
        scheduleId: schedule.id,
      },
    });
  }

  async checkOut(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await this.prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
      include: { schedule: true },
    });

    if (!record || !record.checkIn) throw new BadRequestException('Must check in first');
    if (record.checkOut) throw new BadRequestException('Already checked out for today');

    const now = new Date();
    const durationMs = now.getTime() - record.checkIn.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));

    let status = record.status;

    // Additional logic for Early Leave if not FLEXI
    if (record.schedule && record.schedule.type !== 'FLEXI' && record.schedule.endTime) {
      const [endH, endM] = record.schedule.endTime.split(':').map(Number);
      const scheduledEndTime = new Date(now);
      scheduledEndTime.setHours(endH, endM, 0, 0);

      if (now.getTime() < scheduledEndTime.getTime()) {
        // If they leave early AND were already late, maybe mark as EARLY_LEAVE or keep LATE?
        // Let's assume EARLY_LEAVE is a "worse" or more specific status.
        status = 'EARLY_LEAVE'; 
      }
    }

    return this.prisma.attendance.update({
      where: { id: record.id },
      data: { checkOut: now, durationMinutes, status },
    });
  }

  async getMyLogs(userId: string, limit = 30, month?: string) {
    const where: any = { userId };
    
    if (month) {
      const [year, m] = month.split('-').map(Number);
      const start = new Date(year, m - 1, 1);
      const end = new Date(year, m, 0, 23, 59, 59, 999);
      where.date = { gte: start, lte: end };
    }

    return this.prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
      take: month ? undefined : limit,
      include: { schedule: { select: { name: true, type: true } } },
    });
  }

  async getAllLogs(query: { date?: string; userId?: string } = {}) {
    const where: any = {};
    if (query.date) where.date = new Date(query.date);
    if (query.userId) where.userId = query.userId;

    return this.prisma.attendance.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, department: true } },
        schedule: { select: { name: true, type: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getTodayRecord(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
      include: { schedule: true },
    });
  }

  async adjust(id: string, dto: { checkIn?: string, checkOut?: string, status?: AttendanceStatus, reason: string }) {
    const existing = await this.prisma.attendance.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Attendance record not found');

    const updateData: any = { status: dto.status };
    if (dto.checkIn) {
      const d = new Date(existing.date);
      const [h, m] = dto.checkIn.split(':').map(Number);
      d.setHours(h, m, 0, 0);
      updateData.checkIn = d;
    }
    if (dto.checkOut) {
      const d = new Date(existing.date);
      const [h, m] = dto.checkOut.split(':').map(Number);
      d.setHours(h, m, 0, 0);
      updateData.checkOut = d;
    }

    // Recalculate duration if both exist
    const finalIn = updateData.checkIn || existing.checkIn;
    const finalOut = updateData.checkOut || existing.checkOut;
    if (finalIn && finalOut) {
      updateData.durationMinutes = Math.floor((new Date(finalOut).getTime() - new Date(finalIn).getTime()) / (1000 * 60));
    }

    return this.prisma.attendance.update({
      where: { id },
      data: updateData,
    });
  }
}
