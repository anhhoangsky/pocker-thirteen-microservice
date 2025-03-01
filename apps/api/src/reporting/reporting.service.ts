import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ReportingService {
  constructor(
    @Inject('REPORTING_SERVICE') private readonly reportingClient: ClientProxy,
  ) {}

  async createReportTemplate(templateData: any) {
    return firstValueFrom(
      this.reportingClient.send({ cmd: 'create_report_template' }, templateData),
    );
  }

  async getReportTemplates(type?: string) {
    return firstValueFrom(
      this.reportingClient.send({ cmd: 'get_report_templates' }, { type }),
    );
  }

  async getReportTemplate(id: string) {
    return firstValueFrom(
      this.reportingClient.send({ cmd: 'get_report_template' }, { id }),
    );
  }

  async generateFinancialReport(reportData: any) {
    return firstValueFrom(
      this.reportingClient.send({ cmd: 'generate_financial_report' }, reportData),
    );
  }

  async generateGameStatisticsReport(reportData: any) {
    return firstValueFrom(
      this.reportingClient.send({ cmd: 'generate_game_statistics_report' }, reportData),
    );
  }

  async generatePlayerPerformanceReport(reportData: any) {
    return firstValueFrom(
      this.reportingClient.send({ cmd: 'generate_player_performance_report' }, reportData),
    );
  }

  async generateCustomReport(reportData: any) {
    return firstValueFrom(
      this.reportingClient.send({ cmd: 'generate_custom_report' }, reportData),
    );
  }

  async getReports(type?: string) {
    return firstValueFrom(
      this.reportingClient.send({ cmd: 'get_reports' }, { type }),
    );
  }

  async getReport(id: string) {
    return firstValueFrom(
      this.reportingClient.send({ cmd: 'get_report' }, { id }),
    );
  }

  async deleteReport(id: string) {
    return firstValueFrom(
      this.reportingClient.send({ cmd: 'delete_report' }, { id }),
    );
  }
}