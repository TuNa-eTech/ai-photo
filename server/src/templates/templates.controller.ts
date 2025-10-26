import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { QueryTemplatesDto } from './dto/query-templates.dto';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';

@Controller('v1/templates')
@UseGuards(BearerAuthGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  async list(@Query() query: QueryTemplatesDto) {
    return this.templatesService.listTemplates(query);
  }

  @Get('trending')
  async listTrending(@Query() query: QueryTemplatesDto) {
    return this.templatesService.listTrendingTemplates(query);
  }
}
