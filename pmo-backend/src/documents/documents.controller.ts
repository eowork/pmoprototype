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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto, QueryDocumentDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../auth/decorators';
import { JwtPayload } from '../common/interfaces';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin', 'Staff')
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  /**
   * Get all documents for a specific entity
   * GET /api/documents/:entityType/:entityId
   */
  @Get(':entityType/:entityId')
  findAllForEntity(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Query() query: QueryDocumentDto,
  ) {
    return this.service.findAllForEntity(entityType, entityId, query);
  }

  /**
   * Get a single document by ID
   * GET /api/documents/item/:id
   */
  @Get('item/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  /**
   * Upload a document for an entity
   * POST /api/documents/:entityType/:entityId
   */
  @Post(':entityType/:entityId')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  create(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateDocumentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.create(entityType, entityId, file, dto, user.sub);
  }

  /**
   * Update document metadata
   * PATCH /api/documents/:id
   */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDocumentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.update(id, dto, user.sub);
  }

  /**
   * Delete a document
   * DELETE /api/documents/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.service.remove(id, user.sub);
  }
}
