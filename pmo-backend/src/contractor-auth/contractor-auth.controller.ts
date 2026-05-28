import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContractorAuthService } from './contractor-auth.service';
import { ContractorRegisterDto } from './dto/contractor-register.dto';
import { ContractorLoginDto } from './dto/contractor-login.dto';
import { GenerateInviteDto } from './dto/generate-invite.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser, Public } from '../auth/decorators';
import { JwtPayload } from '../common/interfaces';

// §2.225: All route strings MUST NOT include 'api/' prefix.
// main.ts sets setGlobalPrefix('api') — NestJS prepends /api automatically.
// Convention: @Controller('construction-projects') → /api/construction-projects/...

@Controller()
export class ContractorAuthController {
  constructor(private readonly service: ContractorAuthService) {}

  // ── Public: contractor registration & login ──────────────────────────────

  @Public()
  @Post('contractor/auth/register')
  register(@Body() dto: ContractorRegisterDto) {
    return this.service.register(dto);
  }

  @Public()
  @Post('contractor/auth/login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: ContractorLoginDto) {
    return this.service.login(dto);
  }

  @Public()
  @Get('contractor/auth/invite/:token')
  validateInvite(@Param('token') token: string) {
    return this.service.validateInvite(token);
  }

  @Public()
  @Post('contractor/auth/accept-invite/:token')
  acceptInvite(
    @Param('token') token: string,
    @Body('contractor_user_id') contractorUserId: string,
  ) {
    return this.service.acceptInvite(token, contractorUserId);
  }

  // ── Contractor self-service ──────────────────────────────────────────────

  @Get('contractor/auth/me/projects')
  getMyProjects(@CurrentUser() user: JwtPayload) {
    return this.service.getAssignedProjects(user.sub);
  }

  // ── Admin-only: invite management ────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  @Post('construction-projects/:id/contractor-invites')
  generateInvite(
    @Param('id', ParseUUIDPipe) projectId: string,
    @Body() dto: GenerateInviteDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.generateInvite(projectId, user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  @Get('construction-projects/:id/contractor-invites')
  listInvites(@Param('id', ParseUUIDPipe) projectId: string) {
    return this.service.listInvites(projectId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  @Delete('construction-projects/:id/contractor-invites/:inviteId')
  @HttpCode(HttpStatus.NO_CONTENT)
  revokeInvite(
    @Param('id', ParseUUIDPipe) projectId: string,
    @Param('inviteId', ParseUUIDPipe) inviteId: string,
  ) {
    return this.service.revokeInvite(projectId, inviteId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  @Delete('construction-projects/:id/contractor-invites/:inviteId/delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteInvite(
    @Param('id', ParseUUIDPipe) projectId: string,
    @Param('inviteId', ParseUUIDPipe) inviteId: string,
  ) {
    return this.service.deleteInvite(projectId, inviteId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  @Get('construction-projects/:id/contractor-assignments')
  getProjectContractors(@Param('id', ParseUUIDPipe) projectId: string) {
    return this.service.getProjectContractors(projectId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  @Delete('construction-projects/:id/contractor-assignments/:assignmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeContractor(
    @Param('id', ParseUUIDPipe) projectId: string,
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
  ) {
    return this.service.removeContractor(projectId, assignmentId);
  }
}
