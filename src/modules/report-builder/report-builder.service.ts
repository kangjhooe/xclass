import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ReportBuilderTemplate, ReportBuilderConfig, ReportElement } from './entities/report-builder-template.entity';

@Injectable()
export class ReportBuilderService {
  constructor(
    @InjectRepository(ReportBuilderTemplate)
    private templateRepository: Repository<ReportBuilderTemplate>,
    private dataSource: DataSource, // DataSource is automatically injected by TypeORM
  ) {}

  async createTemplate(
    instansiId: number,
    name: string,
    description: string,
    category: string,
    config: ReportBuilderConfig,
  ) {
    const template = this.templateRepository.create({
      instansiId,
      name,
      description,
      category,
      config,
    });

    return await this.templateRepository.save(template);
  }

  async getTemplates(instansiId: number, category?: string) {
    const query = this.templateRepository
      .createQueryBuilder('template')
      .where('template.instansiId = :instansiId', { instansiId })
      .andWhere('template.isActive = :isActive', { isActive: true });

    if (category) {
      query.andWhere('template.category = :category', { category });
    }

    return await query.orderBy('template.createdAt', 'DESC').getMany();
  }

  async getTemplateById(id: number, instansiId: number) {
    const template = await this.templateRepository.findOne({
      where: { id, instansiId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async updateTemplate(
    id: number,
    instansiId: number,
    updates: Partial<{
      name: string;
      description: string;
      category: string;
      config: ReportBuilderConfig;
      isActive: boolean;
    }>,
  ) {
    const template = await this.getTemplateById(id, instansiId);

    Object.assign(template, updates);
    return await this.templateRepository.save(template);
  }

  async deleteTemplate(id: number, instansiId: number) {
    const template = await this.getTemplateById(id, instansiId);
    await this.templateRepository.remove(template);
  }

  async generateReport(
    templateId: number,
    instansiId: number,
    parameters: Record<string, any> = {},
  ) {
    const template = await this.getTemplateById(templateId, instansiId);

    if (!template.isActive) {
      throw new Error('Template is not active');
    }

    // Process each element and execute queries
    const processedSections = await Promise.all(
      template.config.sections.map(async (section) => {
        const processedElements = await Promise.all(
          section.elements.map(async (element) => {
            return await this.processElement(element, instansiId, parameters);
          }),
        );

        return {
          ...section,
          elements: processedElements,
        };
      }),
    );

    return {
      success: true,
      templateId,
      templateName: template.name,
      config: {
        ...template.config,
        sections: processedSections,
      },
      generatedAt: new Date(),
    };
  }

  private async processElement(
    element: ReportElement,
    instansiId: number,
    parameters: Record<string, any>,
  ): Promise<ReportElement> {
    if (element.type === 'query') {
      const query = element.config.query as string;
      if (!query) {
        return element;
      }

      try {
        // Replace parameters in query
        let processedQuery = query;
        const queryParams: any[] = [];

        // Add instansiId if not in parameters
        if (!parameters.instansiId) {
          parameters.instansiId = instansiId;
        }

        // Replace named parameters
        Object.keys(parameters).forEach((key) => {
          const value = parameters[key];
          const regex = new RegExp(`:${key}\\b`, 'g');
          processedQuery = processedQuery.replace(regex, '?');
          queryParams.push(value);
        });

        // Execute query
        const results = await this.dataSource.query(processedQuery, queryParams);

        // Update element config with results
        return {
          ...element,
          config: {
            ...element.config,
            data: results,
            rowCount: results.length,
          },
        };
      } catch (error) {
        console.error(`Error processing query element ${element.id}:`, error);
        return {
          ...element,
          config: {
            ...element.config,
            error: error.message,
          },
        };
      }
    }

    // For other element types, just return as is
    return element;
  }

  async previewReport(
    config: ReportBuilderConfig,
    instansiId: number,
    parameters: Record<string, any> = {},
  ) {
    // Create a temporary template-like structure
    const tempTemplate = {
      config,
      isActive: true,
    } as ReportBuilderTemplate;

    // Process elements
    const processedSections = await Promise.all(
      config.sections.map(async (section) => {
        const processedElements = await Promise.all(
          section.elements.map(async (element) => {
            return await this.processElement(element, instansiId, parameters);
          }),
        );

        return {
          ...section,
          elements: processedElements,
        };
      }),
    );

    return {
      config: {
        ...config,
        sections: processedSections,
      },
      preview: true,
    };
  }
}

