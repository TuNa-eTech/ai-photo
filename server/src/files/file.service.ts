import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { File, Prisma, StorageType } from '@prisma/client';
import sharp from 'sharp';
import * as crypto from 'crypto';
import { join } from 'path';
import { promises as fs } from 'fs';

export interface CreateFileData {
  originalName: string;
  buffer: Buffer;
  mimeType: string;
  storageType?: StorageType;
  bucket?: string;
}

export interface FileWithMetadata extends File {
  metadata?: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

@Injectable()
export class FileService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Save uploaded file and create database record
   */
  async saveFile(data: CreateFileData): Promise<File> {
    const {
      originalName,
      buffer,
      mimeType,
      storageType = StorageType.local,
      bucket,
    } = data;

    // Validate file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    if (!allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestException(`File type ${mimeType} not allowed`);
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (buffer.length > maxSize) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    // Generate unique filename
    const fileExtension = originalName.split('.').pop() || 'jpg';
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${fileExtension}`;

    // Get image metadata using sharp
    let width: number | undefined;
    let height: number | undefined;
    let format: string | undefined;
    let quality: number | undefined;

    try {
      const metadata = await sharp(buffer).metadata();
      width = metadata.width;
      height = metadata.height;
      format = metadata.format;

      // Estimate quality based on file size and dimensions (rough estimation)
      if (format === 'jpeg' || format === 'webp') {
        quality = Math.min(
          95,
          Math.max(70, (buffer.length / (width * height)) * 100),
        );
      }
    } catch (error) {
      console.error('Error getting image metadata:', error);
    }

    // Generate file hash for deduplication
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    // Check for existing file with same hash
    const existingFile = await this.prisma.file.findFirst({
      where: { hash },
    });

    if (existingFile) {
      return existingFile;
    }

    // Determine file path and URL based on storage type
    const { filePath, fileUrl } = this.getFilePaths(
      filename,
      storageType,
      bucket,
    );

    // Save file to local storage (for now, only local storage is implemented)
    if (storageType === StorageType.local) {
      await this.saveToLocalDisk(filePath, buffer);
    }

    // Create database record
    const file = await this.prisma.file.create({
      data: {
        filename,
        originalName,
        filePath,
        fileUrl,
        fileSize: buffer.length,
        mimeType,
        width,
        height,
        format,
        quality,
        hash,
        storageType,
        bucket,
      },
    });

    return file;
  }

  /**
   * Get file by ID
   */
  async getFile(id: string): Promise<File | null> {
    return this.prisma.file.findUnique({
      where: { id },
    });
  }

  /**
   * Get file by filename
   */
  async getFileByFilename(filename: string): Promise<File | null> {
    return this.prisma.file.findUnique({
      where: { filename },
    });
  }

  /**
   * Delete file and remove from storage
   */
  async deleteFile(id: string): Promise<void> {
    const file = await this.prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    // Delete from local storage
    if (file.storageType === StorageType.local) {
      try {
        await fs.unlink(file.filePath);
      } catch (error) {
        console.error('Error deleting file from disk:', error);
      }
    }

    // Delete from database
    await this.prisma.file.delete({
      where: { id },
    });
  }

  /**
   * Generate thumbnail for an image
   */
  async generateThumbnail(
    fileId: string,
    width: number = 300,
    height: number = 300,
  ): Promise<File> {
    const originalFile = await this.getFile(fileId);
    if (!originalFile) {
      throw new NotFoundException(`File with ID ${fileId} not found`);
    }

    // Read original file
    let originalBuffer: Buffer;
    try {
      originalBuffer = await fs.readFile(originalFile.filePath);
    } catch (error) {
      throw new NotFoundException(`Original file not found on disk`);
    }

    // Generate thumbnail
    const thumbnailBuffer = await sharp(originalBuffer)
      .resize(width, height, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    // Create thumbnail filename
    const thumbnailFilename = `thumb-${originalFile.filename.replace(/\.[^/.]+$/, '.webp')}`;

    // Get paths for thumbnail
    const { filePath, fileUrl } = this.getFilePaths(
      thumbnailFilename,
      originalFile.storageType,
      originalFile.bucket || undefined,
    );

    // Save thumbnail to local storage
    if (originalFile.storageType === StorageType.local) {
      await this.saveToLocalDisk(filePath, thumbnailBuffer);
    }

    // Create thumbnail file record
    const thumbnailFile = await this.prisma.file.create({
      data: {
        filename: thumbnailFilename,
        originalName: `thumb-${originalFile.originalName}`,
        filePath,
        fileUrl,
        fileSize: thumbnailBuffer.length,
        mimeType: 'image/webp',
        width,
        height,
        format: 'webp',
        quality: 80,
        storageType: originalFile.storageType,
        bucket: originalFile.bucket,
      },
    });

    return thumbnailFile;
  }

  /**
   * Get file paths based on storage type
   */
  private getFilePaths(
    filename: string,
    storageType: StorageType,
    bucket?: string,
  ): { filePath: string; fileUrl: string } {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:8080';

    if (storageType === StorageType.local) {
      const filePath = join(process.cwd(), 'public', 'thumbnails', filename);
      const fileUrl = `${baseUrl}/public/thumbnails/${filename}`;
      return { filePath, fileUrl };
    }

    // TODO: Implement S3/CDN paths
    throw new Error(`Storage type ${storageType} not yet implemented`);
  }

  /**
   * Save file to local disk
   */
  private async saveToLocalDisk(
    filePath: string,
    buffer: Buffer,
  ): Promise<void> {
    // Ensure directory exists
    const dir = filePath.substring(0, filePath.lastIndexOf('/'));
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(filePath, buffer);
  }

  /**
   * Find files by criteria
   */
  async findFiles(where: Prisma.FileWhereInput): Promise<File[]> {
    return this.prisma.file.findMany({ where });
  }

  /**
   * Get files by IDs
   */
  async getFilesByIds(ids: string[]): Promise<File[]> {
    return this.prisma.file.findMany({
      where: { id: { in: ids } },
    });
  }

  /**
   * Check if file exists
   */
  async fileExists(id: string): Promise<boolean> {
    const file = await this.prisma.file.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!file;
  }
}
