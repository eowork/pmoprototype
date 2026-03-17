import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, QueryUserDto, QueryEligibleUsersDto, AssignRoleDto, SetPermissionOverrideDto, BulkPermissionUpdateDto, AssignModuleDto, BulkModuleAssignmentDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../auth/decorators';
import { JwtPayload } from '../common/interfaces';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  // --- Read Operations: Admin can view (SuperAdmin bypasses via guard) ---

  @Get()
  @Roles('Admin')
  @ApiOperation({ summary: 'List all users (Admin/SuperAdmin only)' })
  findAll(@Query() query: QueryUserDto) {
    return this.service.findAll(query);
  }

  @Get('roles')
  @Roles('Admin')
  @ApiOperation({ summary: 'Get available roles (Admin/SuperAdmin only)' })
  getRoles() {
    return this.service.getRoles();
  }

  @Get('eligible-for-assignment')
  @Roles('Admin', 'Staff')
  @ApiOperation({ summary: 'List users eligible for record delegation (Admin/Staff) — Phase AV: Global, no campus filter' })
  findEligibleForAssignment() {
    return this.service.findEligibleForAssignment();
  }

  @Get(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Get user details (Admin/SuperAdmin only)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  // --- Write Operations: SuperAdmin only (enforced via guard bypass) ---
  // Note: @Roles() with no matching role means only SuperAdmin can access

  @Post()
  @Roles()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create user (SuperAdmin only)' })
  create(@Body() dto: CreateUserDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user.sub);
  }

  @Patch(':id')
  @Roles()
  @ApiOperation({ summary: 'Update user (SuperAdmin only)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.update(id, dto, user.sub);
  }

  @Delete(':id')
  @Roles()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (SuperAdmin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.service.remove(id, user.sub);
  }

  // --- Role Management: SuperAdmin only ---

  @Post(':id/roles')
  @Roles()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign role to user (SuperAdmin only)' })
  assignRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignRoleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.assignRole(id, dto, user.sub);
  }

  @Delete(':id/roles/:roleId')
  @Roles()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove role from user (SuperAdmin only)' })
  removeRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.removeRole(id, roleId, user.sub);
  }

  // --- Account Management: SuperAdmin only ---

  @Post(':id/unlock')
  @Roles()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlock user account (SuperAdmin only)' })
  unlockAccount(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.service.unlockAccount(id, user.sub);
  }

  @Post(':id/reset-password')
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reset user password (Admin/SuperAdmin, bypasses complexity for lower-rank users)' })
  resetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('password') password: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.resetPassword(id, password, user.sub);
  }

  // --- Permission Overrides: Admin can manage (SuperAdmin bypasses) ---

  @Get(':id/permissions')
  @Roles('Admin')
  @ApiOperation({ summary: 'Get user permission overrides (Admin/SuperAdmin only)' })
  getPermissionOverrides(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getPermissionOverrides(id);
  }

  @Post(':id/permissions')
  @Roles('Admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set permission override (Admin/SuperAdmin only)' })
  setPermissionOverride(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetPermissionOverrideDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.setPermissionOverride(id, dto, user.sub);
  }

  @Post(':id/permissions/bulk')
  @Roles('Admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk update permission overrides (Admin/SuperAdmin only)' })
  @ApiResponse({ status: 200, description: 'Permissions updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  bulkUpdatePermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: BulkPermissionUpdateDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.bulkUpdatePermissions(id, dto, user.sub);
  }

  @Delete(':id/permissions/:moduleKey')
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove permission override (Admin/SuperAdmin only)' })
  removePermissionOverride(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('moduleKey') moduleKey: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.removePermissionOverride(id, moduleKey, user.sub);
  }

  // --- Module Assignments: Admin can manage (SuperAdmin bypasses) ---

  @Get(':id/modules')
  @Roles('Admin')
  @ApiOperation({ summary: 'Get user module assignments (Admin/SuperAdmin only)' })
  getModuleAssignments(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getModuleAssignments(id);
  }

  @Post(':id/modules')
  @Roles('Admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign module to user (Admin/SuperAdmin only)' })
  assignModule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignModuleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.assignModule(id, dto.module, user.sub);
  }

  @Post(':id/modules/bulk')
  @Roles('Admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk update module assignments (Admin/SuperAdmin only)' })
  @ApiResponse({ status: 200, description: 'Module assignments updated successfully' })
  bulkUpdateModuleAssignments(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: BulkModuleAssignmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.bulkUpdateModuleAssignments(id, dto.modules, user.sub);
  }

  @Delete(':id/modules/:module')
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove module assignment (Admin/SuperAdmin only)' })
  removeModuleAssignment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('module') module: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.removeModuleAssignment(id, module, user.sub);
  }
}
