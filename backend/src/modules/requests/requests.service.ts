import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestStatus, RequestType } from '@prisma/client';

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateRequestDto) {
    return this.prisma.request.create({
      data: {
        type: dto.type as RequestType,
        requesterId: userId,
        targetUserId: dto.targetUserId,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
        reason: dto.reason,
        details: dto.details || {},
        status: 'PENDING',
      },
      include: {
        requester: { select: { name: true, email: true } },
        targetUser: { select: { name: true, email: true } },
      },
    });
  }

  async findAllPending() {
    return this.prisma.request.findMany({
      where: { status: 'PENDING' },
      include: {
        requester: { select: { name: true, email: true, department: true } },
        targetUser: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyRequests(userId: string) {
    return this.prisma.request.findMany({
      where: {
        OR: [
          { requesterId: userId },
          { targetUserId: userId },
        ],
      },
      include: {
        requester: { select: { name: true, email: true } },
        targetUser: { select: { name: true, email: true } },
        approver: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, approverId: string, status: 'APPROVED' | 'REJECTED') {
    const request = await this.prisma.request.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== 'PENDING') throw new BadRequestException('Request is already processed');

    // Handle logic when approved?
    // In a full implementation, approving a swap might swap the attendance records for that day.
    
    return this.prisma.request.update({
      where: { id },
      data: {
        status: status as RequestStatus,
        approverId,
      },
    });
  }
}
