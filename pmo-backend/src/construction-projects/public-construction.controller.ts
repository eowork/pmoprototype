import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConstructionProjectsService } from './construction-projects.service';
import { QueryConstructionProjectDto, QueryGalleryDto } from './dto';
import { Public } from '../auth/decorators';

@ApiTags('Public — Construction Projects')
@Controller('public/construction-projects')
export class PublicConstructionController {
  constructor(private readonly service: ConstructionProjectsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List published infrastructure projects (public, no auth)',
  })
  findAll(@Query() query: QueryConstructionProjectDto) {
    const safeQuery = {
      ...query,
      publication_status: 'PUBLISHED',
    } as QueryConstructionProjectDto;
    return this.service.findAll(safeQuery, undefined);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Get published project details (public, no auth)',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findPublicOne(id);
  }

  @Public()
  @Get(':id/gallery')
  @ApiOperation({
    summary: 'Get gallery for published project (public, no auth)',
  })
  async findGallery(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: QueryGalleryDto,
  ) {
    await this.service.findPublicOne(id);
    return this.service.findGallery(id, query);
  }
}
