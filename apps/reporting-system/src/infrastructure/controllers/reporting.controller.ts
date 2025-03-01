import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReportingService } from '../../application/services/reporting.service';
import { ReportType, ReportFormat } from '../../domain/entities/report.entity';

@Controller()
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @MessagePattern({ cmd: 'create_report_template' })
  async createTemplate(@Payload() data: any) {
    return this.reportingService.createTemplate(data);
  }

  @MessagePattern({ cmd: 'get_report_templates' })
  async getTemplates(@Payload() data: { type?: ReportType }) {
    return this.reportingService.getTemplates(data?.type);
  }

  @MessagePattern({ cmd: 'get_report_template' })
  async getTemplate(@Payload() data: { id: string }) {
    return this.reportingService.getTemplate(data.id);
  }

  @MessagePattern({ cmd: 'generate_financial_report' })
  async generateFinancialReport(
    @Payload()
    data: {
      name: string;
      startDate: string;
      endDate: string;
      playerId?: string;
      format?: ReportFormat;
      templateId?: string;
    },
  ) {
    return this.reportingService.generateFinancialReport(data.name, {
      startDate: data.startDate,
      endDate: data.endDate,
      playerId: data.playerId,
      format: data.format,
      templateId: data.templateId,
    });
  }

  @MessagePattern({ cmd: 'generate_game_statistics_report' })
  async generateGameStatisticsReport(
    @Payload()
    data: {
      name: string;
      startDate?: string;
      endDate?: string;
      gameType?: string;
      playerId?: string;
      format?: ReportFormat;
      templateId?: string;
    },
  ) {
    return this.reportingService.generateGameStatisticsReport(data.name, {
      startDate: data.startDate,
      endDate: data.endDate,
      gameType: data.gameType,
      playerId: data.playerId,
      format: data.format,
      templateId: data.templateId,
    });
  }

  @MessagePattern({ cmd: 'generate_player_performance_report' })
  async generatePlayerPerformanceReport(
    @Payload()
    data: {
      name: string;
      playerId: string;
      startDate?: string;
      endDate?: string;
      format?: ReportFormat;
      templateId?: string;
    },
  ) {
    return this.reportingService.generatePlayerPerformanceReport(data.name, {
      playerId: data.playerId,
      startDate: data.startDate,
      endDate: data.endDate,
      format: data.format,
      templateId: data.templateId,
    });
  }

  @MessagePattern({ cmd: 'generate_custom_report' })
  async generateCustomReport(
    @Payload()
    data: {
      name: string;
      templateId: string;
      customFilters?: Record<string, any>;
      format?: ReportFormat;
    },
  ) {
    return this.reportingService.generateCustomReport(data.name, {
      templateId: data.templateId,
      customFilters: data.customFilters,
      format: data.format,
    });
  }

  @MessagePattern({ cmd: 'get_reports' })
  async getReports(@Payload() data: { type?: ReportType }) {
    return this.reportingService.getReports(data?.type);
  }

  @MessagePattern({ cmd: 'get_report' })
  async getReport(@Payload() data: { id: string }) {
    return this.reportingService.getReport(data.id);
  }

  @MessagePattern({ cmd: 'delete_report' })
  async deleteReport(@Payload() data: { id: string }) {
    return this.reportingService.deleteReport(data.id);
  }
}