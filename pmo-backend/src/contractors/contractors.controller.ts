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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ContractorsService } from './contractors.service';
import { CreateContractorDto, UpdateContractorDto, QueryContractorDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../auth/decorators';
import { JwtPayload } from '../common/interfaces';
import { ContractorStatus } from '../common/enums';

@ApiTags('Reference: Contractors')
@ApiBearerAuth('JWT-auth')
@Controller('contractors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin', 'Staff')
export class ContractorsController {
  constructor(private readonly service: ContractorsService) {}

  @Get()
  findAll(@Query() query: QueryContractorDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('Admin')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateContractorDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user.sub);
  }

  @Patch(':id')
  @Roles('Admin')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContractorDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.update(id, dto, user.sub);
  }

  @Delete(':id')
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.service.remove(id, user.sub);
  }

  @Patch(':id/status')
  @Roles('Admin')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ContractorStatus,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.updateStatus(id, status, user.sub);
  }
}
