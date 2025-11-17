import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService, CreateFileData } from './file.service';
import { File } from '@prisma/client';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<File> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const fileData: CreateFileData = {
      originalName: file.originalname,
      buffer: file.buffer,
      mimeType: file.mimetype,
    };

    return this.fileService.saveFile(fileData);
  }

  @Get(':id')
  async getFile(@Param('id') id: string): Promise<File> {
    const file = await this.fileService.getFile(id);
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    return file;
  }

  @Get(':filename/filename')
  async getFileByFilename(@Param('filename') filename: string): Promise<File> {
    const file = await this.fileService.getFileByFilename(filename);
    if (!file) {
      throw new NotFoundException(`File with filename ${filename} not found`);
    }
    return file;
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string): Promise<{ message: string }> {
    await this.fileService.deleteFile(id);
    return { message: 'File deleted successfully' };
  }

  @Post(':id/thumbnail')
  async generateThumbnail(
    @Param('id') id: string,
    @Body() body: { width?: number; height?: number },
  ): Promise<File> {
    const { width = 300, height = 300 } = body;
    return this.fileService.generateThumbnail(id, width, height);
  }
}
