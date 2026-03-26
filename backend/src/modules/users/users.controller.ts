import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.usersService.findAll();
  }

  @Get('managers')
  @Roles('ADMIN', 'MANAGER', 'EMPLOYEE')
  findManagers() {
    return this.usersService.findManagers();
  }

  @Get('employees')
  @Roles('ADMIN', 'MANAGER')
  findEmployees() {
    return this.usersService.findEmployees();
  }

  @Get('assignable')
  @Roles('ADMIN', 'MANAGER')
  findAssignable() {
    return this.usersService.findEmployees(); // Shared logic for now
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/role')
  @Roles('ADMIN')
  assignRole(
    @Param('id') id: string,
    @Body('role') role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE',
  ) {
    return this.usersService.assignRole(id, role);
  }
}
