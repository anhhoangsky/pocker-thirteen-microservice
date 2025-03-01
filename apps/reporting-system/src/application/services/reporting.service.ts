import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Report, ReportType, ReportFormat } from '../../domain/entities/report.entity';
import { ReportTemplate } from '../../domain/entities/report-template.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';
import { createObjectCsvWriter } from 'csv-writer';

@Injectable()
export class ReportingService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(ReportTemplate)
    private readonly templateRepository: Repository<ReportTemplate>,
    @Inject('FINANCIAL_SERVICE') private financialClient: ClientProxy,
    @Inject('GAME_SERVICE') private gameClient: ClientProxy,
  ) {}

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

  async generateFinancialReport(
    name: string,
    parameters: {
      startDate: string;
      endDate: string;
      playerId?: string;
      format?: ReportFormat;
      templateId?: string;
    },
  ): Promise<Report> {
    let template = null;
    if (parameters.templateId) {
      template = await this.templateRepository.findOne({ where: { id: parameters.templateId } });
    }

    // Get financial data from financial service
    const financialData = await firstValueFrom(
      this.financialClient.send({ cmd: 'get_financial_report' }, {
        startDate: parameters.startDate,
        endDate: parameters.endDate,
        playerId: parameters.playerId,
      }),
    );

    // Create report
    const report = this.reportRepository.create({
      name,
      type: ReportType.FINANCIAL,
      format: parameters.format || ReportFormat.JSON,
      parameters,
      data: financialData,
      template,
    });

    const savedReport = await this.reportRepository.save(report);

    // Generate export file if needed
    if (parameters.format && parameters.format !== ReportFormat.JSON) {
      await this.exportReport(savedReport);
    }

    return savedReport;
  }

  async generateGameStatisticsReport(
    name: string,
    parameters: {
      startDate?: string;
      endDate?: string;
      gameType?: string;
      playerId?: string;
      format?: ReportFormat;
      templateId?: string;
    },
  ): Promise<Report> {
    let template = null;
    if (parameters.templateId) {
      template = await this.templateRepository.findOne({ where: { id: parameters.templateId } });
    }

    // Get game statistics from game service
    const gameData = await firstValueFrom(
      this.gameClient.send({ cmd: 'get_game_statistics' }, {
        startDate: parameters.startDate,
        endDate: parameters.endDate,
        gameType: parameters.gameType,
        playerId: parameters.playerId,
      }),
    );

    // Create report
    const report = this.reportRepository.create({
      name,
      type: ReportType.GAME_STATISTICS,
      format: parameters.format || ReportFormat.JSON,
      parameters,
      data: gameData,
      template,
    });

    const savedReport = await this.reportRepository.save(report);

    // Generate export file if needed
    if (parameters.format && parameters.format !== ReportFormat.JSON) {
      await this.exportReport(savedReport);
    }

    return savedReport;
  }

  async generatePlayerPerformanceReport(
    name: string,
    parameters: {
      playerId: string;
      startDate?: string;
      endDate?: string;
      format?: ReportFormat;
      templateId?: string;
    },
  ): Promise<Report> {
    let template = null;
    if (parameters.templateId) {
      template = await this.templateRepository.findOne({ where: { id: parameters.templateId } });
    }

    // Get player financial data
    const financialData = await firstValueFrom(
      this.financialClient.send({ cmd: 'get_player_transactions' }, {
        playerId: parameters.playerId,
        startDate: parameters.startDate,
        endDate: parameters.endDate,
      }),
    );

    // Get player game statistics
    const gameData = await firstValueFrom(
      this.gameClient.send({ cmd: 'get_player_statistics' }, {
        playerId: parameters.playerId,
        startDate: parameters.startDate,
        endDate: parameters.endDate,
      }),
    );

    // Combine data for comprehensive player report
    const reportData = {
      financial: financialData,
      gameStatistics: gameData,
      summary: {
        totalGames: gameData.totalGames,
        winRate: gameData.winRate,
        totalEarnings: financialData.totalAmount,
        averageEarningsPerGame: financialData.totalAmount / (gameData.totalGames || 1),
      },
    };

    // Create report
    const report = this.reportRepository.create({
      name,
      type: ReportType.PLAYER_PERFORMANCE,
      format: parameters.format || ReportFormat.JSON,
      parameters,
      data: reportData,
      template,
    });

    const savedReport = await this.reportRepository.save(report);

    // Generate export file if needed
    if (parameters.format && parameters.format !== ReportFormat.JSON) {
      await this.exportReport(savedReport);
    }

    return savedReport;
  }

  async generateCustomReport(
    name: string,
    parameters: {
      templateId: string;
      customFilters?: Record<string, any>;
      format?: ReportFormat;
    },
  ): Promise<Report> {
    const template = await this.templateRepository.findOne({ where: { id: parameters.templateId } });
    if (!template) {
      throw new Error('Template not found');
    }

    // Get data based on template type
    let reportData;
    switch (template.type) {
      case ReportType.FINANCIAL:
        reportData = await firstValueFrom(
          this.financialClient.send({ cmd: 'get_financial_report' }, parameters.customFilters),
        );
        break;
      case ReportType.GAME_STATISTICS:
        reportData = await firstValueFrom(
          this.gameClient.send({ cmd: 'get_game_statistics' }, parameters.customFilters),
        );
        break;
      case ReportType.PLAYER_PERFORMANCE:
        // Get both financial and game data
        const financialData = await firstValueFrom(
          this.financialClient.send({ cmd: 'get_player_transactions' }, parameters.customFilters),
        );
        const gameData = await firstValueFrom(
          this.gameClient.send({ cmd: 'get_player_statistics' }, parameters.customFilters),
        );
        reportData = { financial: financialData, gameStatistics: gameData };
        break;
      default:
        reportData = {};
    }

    // Apply template configuration to format data
    const formattedData = this.applyTemplateFormatting(reportData, template);

    // Create report
    const report = this.reportRepository.create({
      name,
      type: template.type,
      format: parameters.format || ReportFormat.JSON,
      parameters,
      data: formattedData,
      template,
    });

    const savedReport = await this.reportRepository.save(report);

    // Generate export file if needed
    if (parameters.format && parameters.format !== ReportFormat.JSON) {
      await this.exportReport(savedReport);
    }

    return savedReport;
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

  async deleteReport(id: string): Promise<void> {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (report && report.filePath) {
      try {
        fs.unlinkSync(report.filePath);
      } catch (error) {
        console.error('Error deleting report file:', error);
      }
    }
    await this.reportRepository.delete(id);
  }

  private async exportReport(report: Report): Promise<void> {
    const reportsDir = path.join(process.cwd(), 'reports');
    
    // Create reports directory if it doesn't exist
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const fileName = `${report.id}_${Date.now()}`;
    let filePath: string;
    
    switch (report.format) {
      case ReportFormat.CSV:
        filePath = path.join(reportsDir, `${fileName}.csv`);
        await this.exportToCsv(report.data, filePath);
        break;
      case ReportFormat.PDF:
        filePath = path.join(reportsDir, `${fileName}.pdf`);
        await this.exportToPdf(report.data, filePath, report.template);
        break;
      default:
        filePath = path.join(reportsDir, `${fileName}.json`);
        fs.writeFileSync(filePath, JSON.stringify(report.data, null, 2));
    }
    
    // Update report with file path
    report.filePath = filePath;
    await this.reportRepository.save(report);
  }

  private async exportToCsv(data: any, filePath: string): Promise<void> {
    // Handle different data structures
    let records: any[] = [];
    
    if (Array.isArray(data)) {
      records = data;
    } else if (data.transactions) {
      records = data.transactions;
    } else if (data.games) {
      records = data.games;
    } else if (data.players) {
      records = data.players;
    } else {
      // Flatten complex object
      records = [this.flattenObject(data)];
    }
    
    // Get headers from first record
    const firstRecord = records[0] || {};
    const headers = Object.keys(firstRecord).map(key => ({
      id: key,
      title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
    }));
    
    // Create CSV writer
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: headers,
    });
    
    await csvWriter.writeRecords(records);
  }

  private async exportToPdf(data: any, filePath: string, template?: ReportTemplate): Promise<void> {
    // PDF generation would typically use a library like PDFKit
    // For now, we'll just create a JSON file as a placeholder
    fs.writeFileSync(filePath.replace('.pdf', '.json'), JSON.stringify({
      data,
      template: template ? template.configuration : null,
      message: 'PDF generation would be implemented here with a library like PDFKit',
    }, null, 2));
  }

  private flattenObject(obj: any, prefix = ''): any {
    return Object.keys(obj).reduce((acc, key) => {
      const pre = prefix.length ? `${prefix}.` : '';
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(acc, this.flattenObject(obj[key], pre + key));
      } else if (Array.isArray(obj[key])) {
        acc[pre + key] = JSON.stringify(obj[key]);
      } else {
        acc[pre + key] = obj[key];
      }
      return acc;
    }, {});
  }

  private applyTemplateFormatting(data: any, template: ReportTemplate): any {
    const { fields, filters, sorting, groupBy } = template.configuration;
    
    // Extract and format fields
    let formattedData: any = {};
    
    // Handle array data
    if (Array.isArray(data)) {
      formattedData = data.map(item => {
        const formattedItem: any = {};
        fields.forEach(field => {
          formattedItem[field.name] = item[field.name];
        });
        return formattedItem;
      });
      
      // Apply filters
      if (filters && filters.length > 0) {
        formattedData = formattedData.filter(item => {
          return filters.every(filter => {
            const value = item[filter.field];
            switch (filter.operator) {
              case 'eq': return value === filter.defaultValue;
              case 'gt': return value > filter.defaultValue;
              case 'lt': return value < filter.defaultValue;
              case 'gte': return value >= filter.defaultValue;
              case 'lte': return value <= filter.defaultValue;
              case 'contains': return String(value).includes(filter.defaultValue);
              case 'between': 
                return value >= filter.defaultValue[0] && value <= filter.defaultValue[1];
              default: return true;
            }
          });
        });
      }
      
      // Apply sorting
      if (sorting && sorting.length > 0) {
        formattedData.sort((a: any, b: any) => {
          for (const sort of sorting) {
            const aValue = a[sort.field];
            const bValue = b[sort.field];
            
            if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }
      
      // Apply grouping
      if (groupBy && groupBy.length > 0) {
        const groupedData: any = {};
        
        formattedData.forEach((item: any) => {
          const groupKey = groupBy.map(field => item[field]).join('_');
          
          if (!groupedData[groupKey]) {
            groupedData[groupKey] = {
              ...groupBy.reduce((acc, field) => ({ ...acc, [field]: item[field] }), {}),
              items: [],
            };
          }
          
          groupedData[groupKey].items.push(item);
        });
        
        // Calculate aggregations for each group
        Object.values(groupedData).forEach((group: any) => {
          fields.forEach(field => {
            if (field.aggregation) {
              const values = group.items.map((item: any) => Number(item[field.name])).filter((v: any) => !isNaN(v));
              
              switch (field.aggregation) {
                case 'sum':
                  group[`${field.name}_sum`] = values.reduce((sum: number, val: number) => sum + val, 0);
                  break;
                case 'avg':
                  group[`${field.name}_avg`] = values.length ? 
                    values.reduce((sum: number, val: number) => sum + val, 0) / values.length : 0;
                  break;
                case 'min':
                  group[`${field.name}_min`] = values.length ? Math.min(...values) : null;
                  break;
                case 'max':
                  group[`${field.name}_max`] = values.length ? Math.max(...values) : null;
                  break;
                case 'count':
                  group[`${field.name}_count`] = values.length;
                  break;
              }
            }
          });
        });
        
        formattedData = Object.values(groupedData);
      }
    } else {
      // Handle object data
      fields.forEach(field => {
        const fieldParts = field.name.split('.');
        let value = data;
        
        for (const part of fieldParts) {
          if (value && typeof value === 'object') {
            value = value[part];
          } else {
            value = undefined;
            break;
          }
        }
        
        formattedData[field.name] = value;
      });
    }
    
    return formattedData;
  }
}