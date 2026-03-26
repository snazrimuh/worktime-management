import { PrismaClient, UserRole, ScheduleType, AttendanceStatus, RequestType, RequestStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Starting Worktime Workforce Seeding ---')
  
  // Cleanup
  console.log('Cleaning up existing data...')
  await prisma.notification.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.request.deleteMany()
  await prisma.scheduleAssignment.deleteMany()
  await prisma.schedule.deleteMany()
  await prisma.user.deleteMany()
  try {
    await prisma.systemConfig.deleteMany()
  } catch (e) {
    // SystemConfig might not exist in some states
  }

  const passwordHash = await bcrypt.hash('Password123!', 10)

  // 1. System Config
  await prisma.systemConfig.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      gracePeriodMinutes: 15,
      noShowThresholdMins: 60
    }
  })

  // 2. Schedules
  console.log('Creating schedules...')
  const schedules = await Promise.all([
    prisma.schedule.create({
      data: {
        name: 'Normal Office (09:00 - 18:00)',
        type: ScheduleType.FIXED,
        startTime: '09:00',
        endTime: '18:00',
        gracePeriodMinutes: 15,
      },
    }),
    prisma.schedule.create({
      data: {
        name: 'Early Morning (07:00 - 16:00)',
        type: ScheduleType.FIXED,
        startTime: '07:00',
        endTime: '16:00',
        gracePeriodMinutes: 15,
      },
    }),
    prisma.schedule.create({
      data: {
        name: 'Flexible Midday',
        type: ScheduleType.FLEXI,
        minHours: 8,
      },
    }),
    prisma.schedule.create({
      data: {
        name: 'Night Watch (22:00 - 06:00)',
        type: ScheduleType.SHIFT,
        startTime: '22:00',
        endTime: '06:00',
        gracePeriodMinutes: 10,
      },
    })
  ])

  // 3. Admin & Managers
  console.log('Creating admins and managers...')
  const admin = await prisma.user.create({
    data: {
      name: 'Super Administrator',
      email: 'admin@mail.com',
      password: passwordHash,
      role: UserRole.ADMIN,
      isSystemAdmin: true,
      department: 'Technology',
    },
  })

  const managers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Sarah Management',
        email: 'sarah@mail.com',
        password: passwordHash,
        role: UserRole.MANAGER,
        department: 'Operations',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Michael Lead',
        email: 'michael@mail.com',
        password: passwordHash,
        role: UserRole.MANAGER,
        department: 'Engineering',
      },
    })
  ])

  // 4. Employees
  console.log('Creating employees...')
  const departments = ['Engineering', 'Operations', 'Sales', 'Marketing', 'HR']
  const names = [
    'Alice Smith', 'Bob Johnson', 'Charlie Brown', 'David Wilson', 'Eve Davis',
    'Frank Miller', 'Grace Lee', 'Heidi Garcia', 'Ivan Martinez', 'Judy Robinson',
    'Kevin Clark', 'Linda Lewis', 'Mark Walker', 'Nancy Hall', 'Oscar Allen',
    'Paul Baker', 'Quinn Scott', 'Rose Young', 'Steve King', 'Tina Evans'
  ]

  const employees = await Promise.all(
    names.map((name, i) => {
      const dept = departments[i % departments.length]
      return prisma.user.create({
        data: {
          name,
          email: `${name.toLowerCase().replace(' ', '.')}@mail.com`,
          password: passwordHash,
          role: UserRole.EMPLOYEE,
          department: dept,
        },
      })
    })
  )

  const allStaff = [admin, ...managers, ...employees]

  // 5. Assignments
  console.log('Creating schedule assignments...')
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 6) // 6 months ago

  for (const user of allStaff) {
    const randomSchedule = schedules[Math.floor(Math.random() * schedules.length)]
    await prisma.scheduleAssignment.create({
      data: {
        userId: user.id,
        scheduleId: randomSchedule.id,
        effectiveFrom: startDate,
      },
    })
  }

  // 6. Attendance Data (90 Days)
  console.log('Generating 90 days of attendance for all staff...')
  const daysToSeed = 90
  const today = new Date()
  
  for (const user of allStaff) {
    const assignment = await prisma.scheduleAssignment.findFirst({ where: { userId: user.id } })
    if (!assignment) continue
    const schedule = schedules.find(s => s.id === assignment.scheduleId)!

    for (let i = 0; i < daysToSeed; i++) {
      const date = new Date()
      date.setDate(today.getDate() - i)
      date.setHours(0, 0, 0, 0)

      // Skip today
      if (date.getTime() === new Date().setHours(0,0,0,0)) continue

      // Skip future? No, we are going backwards.

      // Skip weekends with 20% chance
      const dayOfWeek = date.getDay()
      if ((dayOfWeek === 0 || dayOfWeek === 6) && Math.random() > 0.2) continue

      // Randomly skip days for absenteeism (3% chance)
      if (Math.random() < 0.03) {
        await prisma.attendance.create({
          data: {
            userId: user.id,
            scheduleId: schedule.id,
            date: date,
            status: AttendanceStatus.ABSENT,
            notes: 'Unexcused absence'
          }
        })
        continue
      }

      // Generate check-in/out
      let checkIn: Date | null = null
      let checkOut: Date | null = null
      let status: AttendanceStatus = AttendanceStatus.ON_TIME
      
      if (schedule.type === ScheduleType.FIXED || schedule.type === ScheduleType.SHIFT) {
        if (!schedule.startTime || !schedule.endTime) continue
        const [sHour, sMin] = schedule.startTime.split(':').map(Number)
        const [eHour, eMin] = schedule.endTime.split(':').map(Number)

        const checkInOffset = Math.floor(Math.random() * 80) - 40 // -40 to +40 mins
        checkIn = new Date(date)
        checkIn.setHours(sHour, sMin + checkInOffset, 0)

        if (checkInOffset > schedule.gracePeriodMinutes) {
          status = AttendanceStatus.LATE
        }

        const checkOutOffset = Math.floor(Math.random() * 120) - 20
        checkOut = new Date(date)
        if (eHour < sHour) checkOut.setDate(checkOut.getDate() + 1)
        checkOut.setHours(eHour, eMin + checkOutOffset, 0)
        
        if (checkOutOffset < 0) {
          status = status === AttendanceStatus.LATE ? AttendanceStatus.LATE : AttendanceStatus.EARLY_LEAVE
        } else if (checkOutOffset > 120) {
          status = AttendanceStatus.OVERTIME
        }
      } else {
        // FLEXI
        checkIn = new Date(date)
        checkIn.setHours(8 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60))
        checkOut = new Date(checkIn)
        const hoursWorked = 7 + Math.random() * 4
        checkOut.setMinutes(checkOut.getMinutes() + Math.floor(hoursWorked * 60))
        status = hoursWorked >= (schedule.minHours || 8) ? AttendanceStatus.ON_TIME : AttendanceStatus.EARLY_LEAVE
      }

      await prisma.attendance.create({
        data: {
          userId: user.id,
          scheduleId: schedule.id,
          date: date,
          checkIn,
          checkOut,
          status,
          durationMinutes: checkIn && checkOut ? Math.floor((checkOut.getTime() - checkIn.getTime()) / 60000) : null,
          notes: status === AttendanceStatus.LATE ? 'Commute issues' : null
        }
      })
    }
  }

  // 7. Requests
  console.log('Adding sample requests...')
  for (let i = 0; i < 20; i++) {
    const requester = employees[Math.floor(Math.random() * employees.length)]
    const approver = managers[Math.floor(Math.random() * managers.length)]
    const type = Math.random() > 0.5 ? RequestType.CHANGE : RequestType.SWAP
    
    await prisma.request.create({
      data: {
        type,
        status: i % 4 === 0 ? RequestStatus.APPROVED : i % 5 === 0 ? RequestStatus.REJECTED : RequestStatus.PENDING,
        requesterId: requester.id,
        approverId: i % 4 === 0 ? approver.id : null,
        targetUserId: type === RequestType.SWAP ? allStaff.find(e => e.id !== requester.id)?.id : null,
        targetDate: new Date(Date.now() + 86400000 * (i + 1)),
        reason: 'Personal matters or doctor appointment',
      }
    })
  }

  // 8. Notifications
  console.log('Generating notifications...')
  for (const user of allStaff) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'System Access Restored',
        message: 'Your workforce scheduling portal has been updated with new 2026 data.',
        type: 'INFO'
      }
    })
  }

  console.log('--- Seeding Completed Successfully ---')
  console.log('Accounts (Password: Password123!):')
  console.log('- Admin: admin@mail.com')
  console.log('- Manager: sarah@mail.com')
  console.log('- Employee: alice.smith@mail.com')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
