import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { createPaginatedResponse, PaginatedResponse } from '../common/dto';
import { UploadsService } from '../uploads/uploads.service';
import { CreateMediaDto, UpdateMediaDto, QueryMediaDto } from './dto';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly ALLOWED_SORTS = ['created_at', 'media_type', 'title', 'file_name'];
  private readonly ALLOWED_ENTITY_TYPES = [
    'project',
    'construction_project',
    'repair_project',
    'university_operation',
  ];

  constructor(
    private readonly db: DatabaseService,
    private readonly uploadsService: UploadsService,
  ) {}

  private validateEntityType(entityType: string): void {
    if (!this.ALLOWED_ENTITY_TYPES.includes(entityType)) {
      throw new BadRequestException(
        `Invalid entity type: ${entityType}. Allowed: ${this.ALLOWED_ENTITY_TYPES.join(', ')}`,
      );
    }
  }

  async findAllForEntity(
    entityType: string,
    entityId: string,
    query: QueryMediaDto,
  ): Promise<PaginatedResponse<any>> {
    this.validateEntityType(entityType);

    const { page = 1, limit = 20, sort = 'created_at', order = 'desc' } = query;
    const offset = (page - 1) * limit;

    const sortColumn = this.ALLOWED_SORTS.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const conditions: string[] = [
      'deleted_at IS NULL',
      'mediable_type = $1',
      'mediable_id = $2',
    ];
    const params: any[] = [entityType, entityId];
    let paramIndex = 3;

    if (query.media_type) {
      conditions.push(`media_type = $${paramIndex++}`);
      params.push(query.media_type);
    }
    if (query.title) {
      conditions.push(`title ILIKE $${paramIndex++}`);
      params.push(`%${query.title}%`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query(
      `SELECT COUNT(*) FROM media WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await this.db.query(
      `SELECT id, mediable_type, mediable_id, media_type, file_name,
              file_path, file_size, mime_type, title, description, alt_text, created_at, updated_at
       FROM media
       WHERE ${whereClause}
       ORDER BY ${sortColumn} ${sortOrder}
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset],
    );

    return createPaginatedResponse(dataResult.rows, total, page, limit);
  }

  async findOne(id: string): Promise<any> {
    const result = await this.db.query(
      `SELECT * FROM media WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    return result.rows[0];
  }

  async create(
    entityType: string,
    entityId: string,
    file: Express.Multer.File,
    dto: CreateMediaDto,
    userId: string,
  ): Promise<any> {
    this.validateEntityType(entityType);

    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Upload file using uploads service
    const uploadResult = await this.uploadsService.uploadFile(
      file,
      userId,
      entityType,
      entityId,
    );

    const result = await this.db.query(
      `INSERT INTO media
       (mediable_type, mediable_id, media_type, file_name, file_path, file_size, mime_type, title, description, alt_text, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        entityType,
        entityId,
        dto.media_type,
        uploadResult.originalName,
        uploadResult.filePath,
        uploadResult.fileSize,
        uploadResult.mimeType,
        dto.title || null,
        dto.description || null,
        dto.alt_text || null,
        userId,
      ],
    );

    this.logger.log(
      `MEDIA_CREATED: id=${result.rows[0].id}, entity=${entityType}/${entityId}, by=${userId}`,
    );
    return result.rows[0];
  }

  async update(id: string, dto: UpdateMediaDto, userId: string): Promise<any> {
    await this.findOne(id);

    const fields = Object.keys(dto).filter((k) => dto[k] !== undefined);
    if (fields.length === 0) {
      return this.findOne(id);
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => dto[f]);

    const result = await this.db.query(
      `UPDATE media
       SET ${setClause}, updated_by = $${fields.length + 1}, updated_at = NOW()
       WHERE id = $${fields.length + 2} AND deleted_at IS NULL
       RETURNING *`,
      [...values, userId, id],
    );

    this.logger.log(`MEDIA_UPDATED: id=${id}, by=${userId}, fields=[${fields.join(',')}]`);
    return result.rows[0];
  }

  async remove(id: string, userId: string): Promise<void> {
    const media = await this.findOne(id);

    // Delete the file from storage
    if (media.file_path) {
      await this.uploadsService.deleteFile(media.file_path);
    }

    await this.db.query(
      `UPDATE media SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2`,
      [userId, id],
    );

    this.logger.log(`MEDIA_DELETED: id=${id}, by=${userId}`);
  }
}
