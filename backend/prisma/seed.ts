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
  d.setUTCHours(0, 0, 0, 0)
  return d
}

function setTime(baseDate: Date, hhmm: string, minuteOffset = 0) {
  const [hour, minute] = hhmm.split(':').map(Number)
  const d = new Date(baseDate)
  d.setUTCHours(hour, minute + minuteOffset, 0, 0)
  return d
}

async function main() {
  const now = new Date()
  const today = toDateOnly(now)
  const day = 24 * 60 * 60 * 1000

  console.log('--- Worktime seeding started (Comprehensive Corporate Data) ---')

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

  // Schedulers
  const officeSchedule = await prisma.schedule.create({ data: { name: 'Standard Office (09:00 - 18:00)', type: ScheduleType.FIXED, startTime: '09:00', endTime: '18:00' } })
  const earlySchedule = await prisma.schedule.create({ data: { name: 'Morning Shift (07:00 - 16:00)', type: ScheduleType.FIXED, startTime: '07:00', endTime: '16:00' } })
  const flexSchedule = await prisma.schedule.create({ data: { name: 'Dev Flexi Time', type: ScheduleType.FLEXI, minHours: 8 } })
  const nightSchedule = await prisma.schedule.create({ data: { name: 'Data Center Night (22:00 - 06:00)', type: ScheduleType.SHIFT, startTime: '22:00', endTime: '06:00' } })

  // 15 Users
  const userSeeds = [
    { name: 'Alex Rivera', email: 'alex@testmail.com', role: UserRole.ADMIN, isSystemAdmin: true, dept: 'Technology' },
    { name: 'Marcus Thorne', email: 'marcus@testmail.com', role: UserRole.ADMIN, dept: 'Operations' },
    { name: 'Sarah Jenkins', email: 'sarah@testmail.com', role: UserRole.MANAGER, dept: 'Operations' },
    { name: 'David Chen', email: 'david@testmail.com', role: UserRole.EMPLOYEE, dept: 'Engineering' },
    { name: 'Linda Wu', email: 'linda@testmail.com', role: UserRole.EMPLOYEE, dept: 'Design' },
    { name: 'Elena Rodriguez', email: 'elena@testmail.com', role: UserRole.MANAGER, dept: 'Engineering' },
    { name: 'Julian Vane', email: 'julian@testmail.com', role: UserRole.EMPLOYEE, dept: 'Engineering' },
    { name: 'Sophia Loren', email: 'sophia@testmail.com', role: UserRole.EMPLOYEE, dept: 'Engineering' },
    { name: 'Viktor Krum', email: 'viktor@testmail.com', role: UserRole.EMPLOYEE, dept: 'Technology' },
    { name: 'Nadia Petrova', email: 'nadia@testmail.com', role: UserRole.EMPLOYEE, dept: 'Operations' },
    { name: 'Omar Sy', email: 'omar@testmail.com', role: UserRole.ADMIN, dept: 'Technology' },
    { name: 'Xavier Woods', email: 'xavier@testmail.com', role: UserRole.EMPLOYEE, dept: 'Technology' },
    { name: 'Yara Grey', email: 'yara@testmail.com', role: UserRole.EMPLOYEE, dept: 'Operations' },
    { name: 'Zane Smith', email: 'zane@testmail.com', role: UserRole.EMPLOYEE, dept: 'Sales' },
    { name: 'Fiona Gallagher', email: 'fiona@testmail.com', role: UserRole.EMPLOYEE, dept: 'Operations' },
  ]

  const users = await Promise.all(userSeeds.map(u => 
    prisma.user.create({ data: { ...u, password: passwordHash, department: u.dept } })
  ))
  
  const [alex, marcus, sarah, david, linda, elena, julian, sophia, viktor, nadia, omar, xavier, yara, zane, fiona] = users
  
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  // Map users to schedules
  const userToSched = [
    { u: alex, s: officeSchedule }, { u: marcus, s: earlySchedule },
    { u: sarah, s: officeSchedule }, { u: david, s: flexSchedule },
    { u: linda, s: officeSchedule }, { u: elena, s: earlySchedule },
    { u: julian, s: nightSchedule }, { u: sophia, s: officeSchedule },
    { u: viktor, s: flexSchedule }, { u: nadia, s: earlySchedule },
    { u: omar, s: officeSchedule }, { u: xavier, s: nightSchedule },
    { u: yara, s: officeSchedule }, { u: zane, s: flexSchedule },
    { u: fiona, s: earlySchedule },
  ]

  for (const item of userToSched) {
    await prisma.scheduleAssignment.create({ data: { userId: item.u.id, scheduleId: item.s.id, effectiveFrom: sixMonthsAgo } })
  }

  // Attendance Generation (Past 14 days + TODAY)
  console.log('Generating attendance records...')
  for (let i = 0; i <= 14; i++) { // Include i=0 for TODAY
    const date = toDateOnly(new Date(Date.now() - i * day))
    if (date.getUTCDay() === 0 || date.getUTCDay() === 6) continue

    for (const item of userToSched) {
      const isToday = i === 0
      
      // For today, some people haven't checked out yet, or are late
      let checkIn: Date | null = null
      let checkOut: Date | null = null
      let status: AttendanceStatus = AttendanceStatus.ON_TIME

      if (isToday) {
        // Today's scenario: 10 people checked in, 5 not yet
        const userIndex = users.indexOf(item.u)
        if (userIndex < 10) {
          const isLate = userIndex >= 7 // Alex, Marcus, Sarah, David are on time. Sophia, Viktor, Nadia are late.
          const start = item.s.startTime || '09:00'
          checkIn = setTime(date, start, isLate ? 35 : -10)
          status = isLate ? AttendanceStatus.LATE : AttendanceStatus.ON_TIME
          // No checkout yet for today
          checkOut = null
        } else if (userIndex >= 12) {
          // Some are "On Leave" or "Absent" today
          status = userIndex === 14 ? AttendanceStatus.ABSENT : AttendanceStatus.ON_TIME
          checkIn = null
          checkOut = null
          if (userIndex === 14) status = AttendanceStatus.ABSENT
        } else {
            // Checked in and already checked out (Early Leave)
            checkIn = setTime(date, item.s.startTime || '09:00', -5)
            checkOut = setTime(date, '13:00', 0)
            status = AttendanceStatus.EARLY_LEAVE
        }
      } else {
        // Past days scenario
        const isLate = Math.random() > 0.8
        const isEarlyLeave = Math.random() > 0.9
        
        if (item.s.type === ScheduleType.FLEXI) {
          checkIn = setTime(date, '09:30', Math.floor(Math.random() * 40 - 20))
          checkOut = new Date(checkIn.getTime() + (8 * 60 + Math.floor(Math.random() * 60)) * 60000)
        } else {
          const start = item.s.startTime || '09:00'
          const end = item.s.endTime || '18:00'
          checkIn = setTime(date, start, isLate ? 25 : -5)
          checkOut = setTime(date, end, isEarlyLeave ? -30 : 10)
          
          if (isLate) status = AttendanceStatus.LATE
          else if (isEarlyLeave) status = AttendanceStatus.EARLY_LEAVE
        }
      }

      await prisma.attendance.create({
        data: {
          userId: item.u.id,
          scheduleId: item.s.id,
          date,
          checkIn,
          checkOut,
          status,
          durationMinutes: checkIn && checkOut ? Math.floor((checkOut.getTime() - checkIn.getTime()) / 60000) : null,
          notes: status === AttendanceStatus.LATE ? 'Heavy traffic' : status === AttendanceStatus.EARLY_LEAVE ? 'Personal emergency' : null
        }
      }).catch(() => {})
    }
  }

  // Corporate Requests (Leave, Shift Swaps)
  await prisma.request.createMany({
    data: [
      { requesterId: david.id, approverId: elena.id, type: RequestType.CHANGE, status: RequestStatus.PENDING, reason: 'Requesting WFH for internet repair', targetDate: new Date(now.getTime() + 2 * day) },
      { requesterId: julian.id, approverId: sarah.id, type: RequestType.SWAP, status: RequestStatus.APPROVED, reason: 'Family emergency, swapping night shift', targetUserId: xavier.id, targetDate: new Date(now.getTime() + 1 * day) },
      { requesterId: linda.id, approverId: sarah.id, type: RequestType.CHANGE, status: RequestStatus.REJECTED, reason: 'Full day leave on release day', targetDate: new Date(now.getTime() + 3 * day) },
      { requesterId: sophia.id, approverId: elena.id, type: RequestType.CHANGE, status: RequestStatus.PENDING, reason: 'Half day leave for dental appointment', targetDate: today },
    ]
  })

  // Notifications & Audit
  await prisma.notification.createMany({
    data: users.map((u, i) => ({
      userId: u.id,
      title: i % 2 === 0 ? 'Schedule Updated' : 'Policy Reminder',
      message: i % 2 === 0 ? 'Your schedule for next week has been published.' : 'Please remember the 15-minute grace period policy.',
      type: i % 3 === 0 ? 'WARNING' : 'INFO'
    }))
  })

  await prisma.auditLog.createMany({
    data: [
      { userId: alex.id, action: 'CONFIG_UPDATE', entity: 'SystemConfig', entityId: 'global', newData: { gracePeriod: 15 } },
      { userId: sarah.id, action: 'BULK_ATTENDANCE_IMPORT', entity: 'Attendance', entityId: 'BATCH-001', newData: { count: 154 } },
      { userId: marcus.id, action: 'SCHEDULE_CREATED', entity: 'Schedule', entityId: nightSchedule.id, newData: { name: nightSchedule.name } }
    ]
  })

  console.log('--- Worktime seeding completed successfully ---')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
