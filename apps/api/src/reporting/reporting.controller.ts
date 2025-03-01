import { Controller, Get, Post, Body, Param, Delete, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportingService } from './reporting.service';

@Controller('reporting')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Post('templates')
  async createTemplate(@Body() templateData: any) {
    return this.reportingService.createReportTemplate(templateData);
  }

  @Get('templates')
  async getTemplates(@Query('type') type?: string) {
    return this.reportingService.getReportTemplates(type);
  }

  @Get('templates/:id')
  async getTemplate(@Param('id') id: string) {
    return this.reportingService.getReportTemplate(id);
  }

  @Post('financial')
  async generateFinancialReport(@Body() reportData: any) {
    return this.reportingService.generateFinancialReport(reportData);
  }

  @Post('game-statistics')
  async generateGameStatisticsReport(@Body() reportData: any) {
    return this.reportingService.generateGameStatisticsReport(reportData);
  }

  @Post('player-performance')
  async generatePlayerPerformanceReport(@Body() reportData: any) {
    return this.reportingService.generatePlayerPerformanceReport(reportData);
  }

  @Post('custom')
  async generateCustomReport(@Body() reportData: any) {
    return this.reportingService.generateCustomReport(reportData);
  }

  @Get()
  async getReports(@Query('type') type?: string) {
    return this.reportingService.getReports(type);
  }

  @Get(':id')
  async getReport(@Param('id') id: string) {
    return this.reportingService.getReport(id);
  }

  @Get(':id/download')
  async downloadReport(@Param('id') id: string, @Res() res: Response) {
    const report = await this.reportingService.getReport(id);
    
    if (!report || !report.filePath) {
      return res.status(404).json({ message: 'Report file not found' });
    }
    
    return res.download(report.filePath);
  }

  @Delete(':id')
  async deleteReport(@Param('id') id: string) {
    return this.reportingService.deleteReport(id);
  }
}