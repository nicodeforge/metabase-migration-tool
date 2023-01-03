import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { MetabaseRepository } from './repositories/metabase.repository';
import { InstanceTypeEnum } from './database/instance-type.enum';
import { ReportDashboardCardDto } from './repositories/report-dashboardcard.dto';
import { MetabaseService } from './services/metabase.service';
import { DashboardDependencyDto } from './repositories/dashboard-dependency.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly metabaseService: MetabaseService,
  ) {}

  @Get()
  async getHello(): Promise<DashboardDependencyDto> {
    return await this.metabaseService.getDependencyForDashboard(
      InstanceTypeEnum.production,
      2,
    );
  }

  @Get('/dashboard/:instance/:dashboardId')
  public async getDashboard(
    @Param('instance') instance: InstanceTypeEnum,
    @Param('dashboardId') dashboardId: number,
  ): Promise<any> {
    return await this.metabaseService.getDependencyForDashboard(
      instance,
      dashboardId,
    );
  }

  @Get('/dashboard/duplicate/:originInstance/:dashboardId/:destinationInstance')
  public async duplicateDashboardAcrossInstances(
    @Param('originInstance') originInstance: InstanceTypeEnum,
    @Param('destinationInstance') destinationInstance: InstanceTypeEnum,
    @Param('dashboardId') dashboardId: number,
  ): Promise<any> {
    return await this.metabaseService.duplicateDashboardAcrossInstances(
      originInstance,
      destinationInstance,
      dashboardId,
    );
  }
}
