import { TemplatesService } from './templates.service';
import { QueryTemplatesDto } from './dto/query-templates.dto';
export declare class TemplatesController {
    private readonly templatesService;
    constructor(templatesService: TemplatesService);
    list(query: QueryTemplatesDto): Promise<{
        templates: import("./templates.service").ApiTemplate[];
    }>;
}
