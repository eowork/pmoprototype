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
import { UniversityOperationsService } from './university-operations.service';
import {
  CreateOperationDto,
  UpdateOperationDto,
  QueryOperationDto,
  CreateIndicatorDto,
  CreateFinancialDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../auth/decorators';
import { JwtPayload } from '../common/interfaces';

@Controller('university-operations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin', 'Staff')
export class UniversityOperationsController {
  constructor(private readonly service: UniversityOperationsService) {}

  @Get()
  findAll(@Query() query: QueryOperationDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateOperationDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user.sub);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOperationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.update(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.service.remove(id, user.sub);
  }

  // --- Indicators ---
  @Get(':id/indicators')
  findIndicators(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('fiscal_year') fiscalYear?: number,
  ) {
    return this.service.findIndicators(id, fiscalYear);
  }

  @Post(':id/indicators')
  @HttpCode(HttpStatus.CREATED)
  createIndicator(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateIndicatorDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.createIndicator(id, dto, user.sub);
  }

  @Patch(':id/indicators/:indicatorId')
  updateIndicator(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('indicatorId', ParseUUIDPipe) indicatorId: string,
    @Body() dto: Partial<CreateIndicatorDto>,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.updateIndicator(id, indicatorId, dto, user.sub);
  }

  @Delete(':id/indicators/:indicatorId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeIndicator(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('indicatorId', ParseUUIDPipe) indicatorId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.removeIndicator(id, indicatorId, user.sub);
  }

  // --- Financials ---
  @Get(':id/financials')
  findFinancials(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('fiscal_year') fiscalYear?: number,
    @Query('quarter') quarter?: string,
  ) {
    return this.service.findFinancials(id, fiscalYear, quarter);
  }

  @Post(':id/financials')
  @HttpCode(HttpStatus.CREATED)
  createFinancial(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateFinancialDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.createFinancial(id, dto, user.sub);
  }

  @Patch(':id/financials/:financialId')
  updateFinancial(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('financialId', ParseUUIDPipe) financialId: string,
    @Body() dto: Partial<CreateFinancialDto>,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.updateFinancial(id, financialId, dto, user.sub);
  }

  @Delete(':id/financials/:financialId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFinancial(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('financialId', ParseUUIDPipe) financialId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.removeFinancial(id, financialId, user.sub);
  }
}
