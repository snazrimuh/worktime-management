import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAttendanceSummary(query: { from?: string; to?: string; month?: string; userId?: string }) {
    let fromDate: Date;
    let toDate: Date;

    if (query.month) {
      const parts = query.month.split('-').map(Number)
      if (parts.length < 2) return { summary: null, logs: [] } // Or handle error
      const [year, m] = parts
      fromDate = new Date(year, m - 1, 1);
      toDate = new Date(year, m, 0, 23, 59, 59, 999);
    } else {
      fromDate = new Date(query.from || new Date().toISOString());
      toDate = new Date(query.to || new Date().toISOString());
      toDate.setHours(23, 59, 59, 999);
    }

    const where: any = { date: { gte: fromDate, lte: toDate } };
    if (query.userId) where.userId = query.userId;

    const logs = await this.prisma.attendance.findMany({
      where,
      include: {
        user: { select: { name: true, department: true } },
        schedule: { select: { name: true } },
      },
      orderBy: { date: 'asc' },
    });

    const summary = {
      total: logs.length,
      onTime: logs.filter(l => l.status === 'ON_TIME').length,
      late: logs.filter(l => l.status === 'LATE').length,
      earlyLeave: logs.filter(l => l.status === 'EARLY_LEAVE').length,
      absent: logs.filter(l => l.status === 'ABSENT').length,
      avgDuration: logs.filter(l => l.durationMinutes).reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0) / (logs.filter(l => l.durationMinutes).length || 1),
    };

    const mappedLogs = logs.map(l => ({
      ...l,
      employeeName: l.user.name,
      department: l.user.department,
      scheduleName: l.schedule?.name,
      checkIn: l.checkIn ? l.checkIn.toTimeString().slice(0, 5) : null,
      checkOut: l.checkOut ? l.checkOut.toTimeString().slice(0, 5) : null,
      duration: l.durationMinutes ? `${Math.floor(l.durationMinutes / 60)}h ${l.durationMinutes % 60}m` : null,
    }));

    return { summary, logs: mappedLogs };
  }
}
