import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateSettingDto, UpdateSettingDto, QuerySettingDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../auth/decorators';
import { JwtPayload } from '../common/interfaces';

@ApiTags('System Settings')
@ApiBearerAuth('JWT-auth')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get()
  @Roles('Admin', 'Staff')
  findAll(@Query() query: QuerySettingDto, @CurrentUser() user: JwtPayload) {
    const isAdmin = user.roles?.includes('Admin') || false;
    return this.service.findAll(query, isAdmin);
  }

  @Get('group/:group')
  @Roles('Admin', 'Staff')
  findByGroup(@Param('group') group: string, @CurrentUser() user: JwtPayload) {
    const isAdmin = user.roles?.includes('Admin') || false;
    return this.service.findByGroup(group, isAdmin);
  }

  @Get(':key')
  @Roles('Admin', 'Staff')
  findByKey(@Param('key') key: string, @CurrentUser() user: JwtPayload) {
    const isAdmin = user.roles?.includes('Admin') || false;
    return this.service.findByKey(key, isAdmin);
  }

  @Post()
  @Roles('Admin')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateSettingDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user.sub);
  }

  @Patch(':key')
  @Roles('Admin')
  updateByKey(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.updateByKey(key, dto, user.sub);
  }

  @Delete(':key')
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeByKey(@Param('key') key: string, @CurrentUser() user: JwtPayload) {
    return this.service.removeByKey(key, user.sub);
  }
}
