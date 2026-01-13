import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users')
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('users/:id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Post('users')
  async create(
    @Body() dto: CreateUserDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.create(dto, userId);
  }

  @Patch('users/:id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.update(id, dto, userId);
  }

  @Patch('users/:id/status')
  async toggleStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.toggleStatus(id, userId);
  }

  @Patch('users/:id/unlock')
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.unlock(id, userId);
  }

  @Delete('users/:id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.usersService.softDelete(id, userId);
    return { message: 'User deleted successfully' };
  }

  @Get('roles')
  async getRoles() {
    return this.usersService.getRoles();
  }

  @Post('users/:id/roles')
  async assignRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignRoleDto,
    @CurrentUser('id') userId: string,
  ) {
    await this.usersService.assignRole(id, dto.role_id, userId);
    return { message: 'Role assigned successfully' };
  }

  @Delete('users/:id/roles/:roleId')
  async removeRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.usersService.removeRole(id, roleId, userId);
    return { message: 'Role removed successfully' };
  }
}
