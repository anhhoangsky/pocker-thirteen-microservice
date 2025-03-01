import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportType } from '../../domain/entities/report.entity';
import { ReportTemplate } from '../../domain/entities/report-template.entity';

@Injectable()
export class ReportingRepository {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(ReportTemplate)
    private readonly templateRepository: Repository<ReportTemplate>,
  ) {}

  async createReport(reportData: Partial<Report>): Promise<Report> {
    const report = this.reportRepository.create(reportData);
    return this.reportRepository.save(report);
  }

  async getReports(type?: ReportType): Promise<Report[]> {
    const query = this.reportRepository.createQueryBuilder('report')
      .leftJoinAndSelect('report.template', 'template');
    
    if (type) {
      query.where('report.type = :type', { type });
    }
    
    return query.orderBy('report.createdAt', 'DESC').getMany();
  }

  async getReport(id: string): Promise<Report> {
    return this.reportRepository.findOne({ 
      where: { id },
      relations: ['template']
    });
  }

  async updateReport(id: string, reportData: Partial<Report>): Promise<Report> {
    await this.reportRepository.update(id, reportData);
    return this.getReport(id);
  }

  async deleteReport(id: string): Promise<void> {
    await this.reportRepository.delete(id);
  }

  async createTemplate(templateData: Partial<ReportTemplate>): Promise<ReportTemplate> {
    const template = this.templateRepository.create(templateData);
    return this.templateRepository.save(template);
  }

  async getTemplates(type?: ReportType): Promise<ReportTemplate[]> {
    const query = this.templateRepository.createQueryBuilder('template');
    
    if (type) {
      query.where('template.type = :type', { type });
    }
    
    return query.getMany();
  }

  async getTemplate(id: string): Promise<ReportTemplate> {
    return this.templateRepository.findOne({ where: { id } });
  }

  async updateTemplate(id: string, templateData: Partial<ReportTemplate>): Promise<ReportTemplate> {
    await this.templateRepository.update(id, templateData);
    return this.getTemplate(id);
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.templateRepository.delete(id);
  }
}