import {
  AttendanceStatus,
  PrismaClient,
  RequestStatus,
  RequestType,
  ScheduleType,
  UserRole,
} from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

function toDateOnly(input: Date) {
  const d = new Date(input)
  d.setHours(0, 0, 0, 0)
  return d
}

function setTime(baseDate: Date, hhmm: string, minuteOffset = 0) {
  const [hour, minute] = hhmm.split(':').map(Number)
  const d = new Date(baseDate)
  d.setHours(hour, minute + minuteOffset, 0, 0)
  return d
}

async function main() {
  console.log('--- Worktime seeding started (SSO-aligned users) ---')

  await prisma.notification.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.request.deleteMany()
  await prisma.scheduleAssignment.deleteMany()
  await prisma.schedule.deleteMany()
  await prisma.user.deleteMany()
  await prisma.systemConfig.deleteMany()

  const passwordHash = await bcrypt.hash('password123', 10)

  await prisma.systemConfig.create({
    data: {
      id: 'global',
      gracePeriodMinutes: 15,
      noShowThresholdMins: 60,
    },
  })

  const [officeSchedule, earlySchedule, flexSchedule, nightSchedule] = await Promise.all([
    prisma.schedule.create({
      data: {
        name: 'Office Shift (09:00 - 18:00)',
        type: ScheduleType.FIXED,
        startTime: '09:00',
        endTime: '18:00',
        gracePeriodMinutes: 15,
      },
    }),
    prisma.schedule.create({
      data: {
        name: 'Early Shift (07:00 - 16:00)',
        type: ScheduleType.FIXED,
        startTime: '07:00',
        endTime: '16:00',
        gracePeriodMinutes: 10,
      },
    }),
    prisma.schedule.create({
      data: {
        name: 'Flexi Shift',
        type: ScheduleType.FLEXI,
        minHours: 8,
      },
    }),
    prisma.schedule.create({
      data: {
        name: 'Night Shift (22:00 - 06:00)',
        type: ScheduleType.SHIFT,
        startTime: '22:00',
        endTime: '06:00',
        gracePeriodMinutes: 10,
      },
    }),
  ])

  // SSO user identity must match Portal Hub and Asset-Space.
  const [alex, marcus, sarah, david, linda] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alex Rivera',
        email: 'alex@testmail.com',
        password: passwordHash,
        role: UserRole.ADMIN,
        isSystemAdmin: true,
        department: 'Technology',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Marcus Thorne',
        email: 'marcus@testmail.com',
        password: passwordHash,
        role: UserRole.ADMIN,
        department: 'Operations',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Sarah Jenkins',
        email: 'sarah@testmail.com',
        password: passwordHash,
        role: UserRole.MANAGER,
        department: 'Operations',
      },
    }),
    prisma.user.create({
      data: {
        name: 'David Chen',
        email: 'david@testmail.com',
        password: passwordHash,
        role: UserRole.EMPLOYEE,
        department: 'Engineering',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Linda Wu',
        email: 'linda@testmail.com',
        password: passwordHash,
        role: UserRole.EMPLOYEE,
        department: 'Design',
      },
    }),
  ])

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  await Promise.all([
    prisma.scheduleAssignment.create({
      data: {
        userId: alex.id,
        scheduleId: officeSchedule.id,
        effectiveFrom: sixMonthsAgo,
      },
    }),
    prisma.scheduleAssignment.create({
      data: {
        userId: marcus.id,
        scheduleId: earlySchedule.id,
        effectiveFrom: sixMonthsAgo,
      },
    }),
    prisma.scheduleAssignment.create({
      data: {
        userId: sarah.id,
        scheduleId: officeSchedule.id,
        effectiveFrom: sixMonthsAgo,
      },
    }),
    prisma.scheduleAssignment.create({
      data: {
        userId: david.id,
        scheduleId: flexSchedule.id,
        effectiveFrom: sixMonthsAgo,
      },
    }),
    prisma.scheduleAssignment.create({
      data: {
        userId: linda.id,
        scheduleId: officeSchedule.id,
        effectiveFrom: sixMonthsAgo,
      },
    }),
  ])

  const users = [alex, marcus, sarah, david, linda]
  const userScheduleMap = new Map<string, { scheduleId: string; start?: string; end?: string; type: ScheduleType; minHours?: number }>([
    [alex.id, { scheduleId: officeSchedule.id, start: '09:00', end: '18:00', type: ScheduleType.FIXED }],
    [marcus.id, { scheduleId: earlySchedule.id, start: '07:00', end: '16:00', type: ScheduleType.FIXED }],
    [sarah.id, { scheduleId: officeSchedule.id, start: '09:00', end: '18:00', type: ScheduleType.FIXED }],
    [david.id, { scheduleId: flexSchedule.id, type: ScheduleType.FLEXI, minHours: 8 }],
    [linda.id, { scheduleId: officeSchedule.id, start: '09:00', end: '18:00', type: ScheduleType.FIXED }],
  ])

  const attendanceRows: Array<{
    userId: string
    scheduleId: string
    date: Date
    checkIn: Date | null
    checkOut: Date | null
    status: AttendanceStatus
    durationMinutes: number | null
    notes: string | null
  }> = []

  for (let i = 1; i <= 21; i++) {
    const date = toDateOnly(new Date(Date.now() - i * 24 * 60 * 60 * 1000))
    const day = date.getDay()
    if (day === 0 || day === 6) continue

    for (const user of users) {
      const setup = userScheduleMap.get(user.id)
      if (!setup) continue

      let checkIn: Date | null = null
      let checkOut: Date | null = null
      let status: AttendanceStatus = AttendanceStatus.ON_TIME
      let notes: string | null = null

      if (setup.type === ScheduleType.FLEXI) {
        const startOffset = i % 3 === 0 ? 20 : -10
        checkIn = setTime(date, '09:30', startOffset)
        const hours = i % 5 === 0 ? 7.5 : 8.7
        checkOut = new Date(checkIn)
        checkOut.setMinutes(checkOut.getMinutes() + Math.floor(hours * 60))
        status = hours >= (setup.minHours || 8) ? AttendanceStatus.ON_TIME : AttendanceStatus.EARLY_LEAVE
        if (status === AttendanceStatus.EARLY_LEAVE) notes = 'Left early for personal appointment'
      } else {
        const start = setup.start || '09:00'
        const end = setup.end || '18:00'
        const lateOffset = i % 7 === 0 && user.id === linda.id ? 22 : i % 6 === 0 && user.id === david.id ? 18 : -5
        const earlyOutOffset = i % 8 === 0 && user.id === marcus.id ? -25 : 15

        checkIn = setTime(date, start, lateOffset)
        checkOut = setTime(date, end, earlyOutOffset)

        if (lateOffset > 15) {
          status = AttendanceStatus.LATE
          notes = 'Traffic delay'
        }
        if (earlyOutOffset < 0) {
          status = status === AttendanceStatus.LATE ? AttendanceStatus.LATE : AttendanceStatus.EARLY_LEAVE
          if (!notes) notes = 'Left early for operational visit'
        }
      }

      attendanceRows.push({
        userId: user.id,
        scheduleId: setup.scheduleId,
        date,
        checkIn,
        checkOut,
        status,
        durationMinutes: checkIn && checkOut ? Math.floor((checkOut.getTime() - checkIn.getTime()) / 60000) : null,
        notes,
      })
    }
  }

  // Add one explicit absent record.
  attendanceRows.push({
    userId: david.id,
    scheduleId: flexSchedule.id,
    date: toDateOnly(new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)),
    checkIn: null,
    checkOut: null,
    status: AttendanceStatus.ABSENT,
    durationMinutes: null,
    notes: 'Sick leave',
  })

  // Attendance has a unique constraint on (userId, date), so collapse duplicates first.
  const attendanceByUserDate = new Map<string, (typeof attendanceRows)[number]>()
  for (const row of attendanceRows) {
    attendanceByUserDate.set(`${row.userId}-${row.date.toISOString()}`, row)
  }

  await prisma.attendance.createMany({
    data: Array.from(attendanceByUserDate.values()),
    skipDuplicates: true,
  })

  await Promise.all([
    prisma.request.create({
      data: {
        type: RequestType.CHANGE,
        status: RequestStatus.PENDING,
        requesterId: david.id,
        approverId: sarah.id,
        targetDate: toDateOnly(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
        reason: 'Need late start for medical check-up',
      },
    }),
    prisma.request.create({
      data: {
        type: RequestType.SWAP,
        status: RequestStatus.APPROVED,
        requesterId: linda.id,
        approverId: sarah.id,
        targetUserId: david.id,
        targetDate: toDateOnly(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)),
        reason: 'Swap shift due to client workshop',
      },
    }),
    prisma.request.create({
      data: {
        type: RequestType.CHANGE,
        status: RequestStatus.REJECTED,
        requesterId: david.id,
        approverId: marcus.id,
        targetDate: toDateOnly(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)),
        reason: 'Requested full-day remote without notice',
      },
    }),
  ])

  await Promise.all([
    prisma.notification.create({
      data: {
        userId: alex.id,
        title: 'System Initialized',
        message: 'Worktime baseline data has been synchronized with Unified SSO users.',
        type: 'INFO',
      },
    }),
    prisma.notification.create({
      data: {
        userId: sarah.id,
        title: 'Pending Request',
        message: 'David submitted a schedule change request requiring approval.',
        type: 'WARNING',
      },
    }),
    prisma.notification.create({
      data: {
        userId: david.id,
        title: 'Request Update',
        message: 'One of your schedule requests has been rejected by Operations Admin.',
        type: 'DANGER',
      },
    }),
  ])

  await prisma.auditLog.createMany({
    data: [
      {
        userId: alex.id,
        action: 'SEED_BOOTSTRAP',
        entity: 'SystemConfig',
        entityId: 'global',
        newData: { gracePeriodMinutes: 15, noShowThresholdMins: 60 },
      },
      {
        userId: sarah.id,
        action: 'SCHEDULE_ASSIGNMENT_CREATED',
        entity: 'ScheduleAssignment',
        entityId: 'seed-assignment-sarah',
        newData: { user: 'sarah@testmail.com', schedule: officeSchedule.name },
      },
      {
        userId: marcus.id,
        action: 'ATTENDANCE_DATA_GENERATED',
        entity: 'Attendance',
        entityId: 'seed-attendance-batch-2026',
        newData: { days: 21, users: 5 },
      },
    ],
  })

  console.log('--- Worktime seeding completed ---')
  console.log('Users seeded (password: password123):')
  console.log('- alex@testmail.com (ADMIN, isSystemAdmin=true)')
  console.log('- marcus@testmail.com (ADMIN)')
  console.log('- sarah@testmail.com (MANAGER)')
  console.log('- david@testmail.com (EMPLOYEE)')
  console.log('- linda@testmail.com (EMPLOYEE)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
