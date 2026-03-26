import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalEmployees = await this.prisma.user.count({
      where: { role: 'EMPLOYEE' },
    });

    const scheduledToday = await this.prisma.scheduleAssignment.count({
      where: {
        effectiveFrom: { lte: today },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: today } }],
      },
    });

    const attendanceRecords = await this.prisma.attendance.findMany({
      where: { date: today },
    });

    const presentCount = attendanceRecords.filter(r => r.checkIn).length;
    const lateCount = attendanceRecords.filter(r => r.status === 'LATE').length;
    const absentCount = scheduledToday - presentCount; // Simple logic: scheduled but didn't check in
    const onLeaveCount = attendanceRecords.filter(r => r.status === 'ABSENT').length; // Assuming some are marked specifically as absent/leave

    const onTimeRate = presentCount > 0 
      ? ((presentCount - lateCount) / presentCount) * 100 
      : 0;

    const pendingChangeRequests = await this.prisma.request.count({
      where: { type: 'CHANGE', status: 'PENDING' },
    });

    const pendingSwapRequests = await this.prisma.request.count({
      where: { type: 'SWAP', status: 'PENDING' },
    });

    // Upcoming shifts (next 5)
    const upcomingShifts = await this.prisma.scheduleAssignment.findMany({
      where: {
        effectiveFrom: { lte: today },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: today } }],
      },
      include: {
        user: { select: { name: true } },
        schedule: { select: { name: true, startTime: true, endTime: true } },
      },
      take: 5,
    });

    // Recent Activity (last 10 check-ins)
    const recentAttendance = await this.prisma.attendance.findMany({
      where: { date: today },
      orderBy: { checkIn: 'desc' },
      take: 10,
      include: {
        user: { select: { name: true } },
        schedule: { select: { name: true } },
      },
    });

    return {
      totalEmployees,
      scheduledToday,
      presentCount,
      lateCount,
      absentCount: Math.max(0, absentCount),
      onLeaveCount,
      onTimeRate,
      pendingChangeRequests,
      pendingSwapRequests,
      upcomingShifts: upcomingShifts.map(a => ({
        id: a.id,
        employeeName: a.user.name,
        scheduleName: a.schedule.name,
        startTime: a.schedule.startTime || 'Flexi',
        endTime: a.schedule.endTime || 'Flexi',
        type: a.schedule.name,
      })),
      recentAttendance: recentAttendance.map(r => ({
        id: r.id,
        employeeName: r.user.name,
        checkIn: r.checkIn ? r.checkIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
        scheduledTime: r.schedule.name,
        status: r.status,
      })),
    };
  }
}
