import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DashboardWithDependenciesDto } from '../dto/metabase/dashboard-with-dependencies.dto';
import { MetabaseApiService } from '../services/metabase-api.service';
import { DashboardDto } from '../dto/metabase/dashboard.dto';
import { MetabaseCoreUserDto } from '../dto/metabase/metabase-core-user.dto';
import { InstanceService } from '../instance/instance.service';
import { InstanceEntity } from '../instance/instance.entity';
import { DashboardDependencyRequestDto } from '../dto/app/dashboard-dependency-request.dto';
import { SaveDashboardRequestDto } from '../dto/app/save-dashboard-request.dto';
import { DatabaseCheckSchemaRequestDto } from '../dto/app/database-check-schema-request.dto';
import { MetabaseCollectionAncestor } from '../dto/metabase/metabase-collection.dto';
import { CardDto } from '../dto/metabase/card.dto';
import { ModelDependencyRequest } from '../dto/app/model-dependency-request';
import { ModelWithDependenciesDto } from '../dto/app/model-with-dependencies.dto';
import { ModelService } from '../services/model.service';
import { DatabaseSchemaEqualityInterface } from '../models/database-schema-equality.interface';
import { SaveModelRequestDto } from '../dto/app/save-model-request.dto';
import { DashboardService } from '../services/dashboard.service';
import { CardService } from '../services/card.service';
import { DatabaseService } from '../services/database.service';

@Controller()
export class MetabaseController {
  constructor(
    private readonly metabaseApiService: MetabaseApiService,
    private readonly instanceService: InstanceService,
    private readonly modelService: ModelService,
    private readonly dashboardService: DashboardService,
    private readonly cardService: CardService,
    private readonly databaseService: DatabaseService,
  ) {}
  @Post('/metabase/dashboard/duplicate')
  public async duplicateDashboardAcrossInstancesThroughApi(
    @Body() payload: DashboardDependencyRequestDto,
  ): Promise<DashboardWithDependenciesDto> {
    const originInstance = await this.instanceService.findById(
      payload.originInstanceId,
    );
    const destinationInstance = await this.instanceService.findById(
      payload.destinationInstanceId,
    );

    return await this.metabaseApiService.getDashboardWithDependencies(
      originInstance,
      destinationInstance,
      payload.dashboardId,
    );
  }

  @Post('/metabase/dashboard/save')
  public async saveDashboard(
    @Body() saveDashboardRequest: SaveDashboardRequestDto,
  ): Promise<any> {
    console.log(
      'Received raw dashboard collections: ',
      JSON.stringify(saveDashboardRequest.dashboard.collections),
    );
    const originInstance = await this.instanceService.findById(
      saveDashboardRequest.originInstanceId,
    );
    const destinationInstance = await this.instanceService.findById(
      saveDashboardRequest.destinationInstanceId,
    );
    return await this.metabaseApiService.saveDashboard(
      originInstance,
      destinationInstance,
      saveDashboardRequest.dashboard,
    );
  }

  @Get('/metabase/:instanceId/dashboards')
  public async getAllDashboards(
    @Param('instanceId') instanceId: string,
  ): Promise<DashboardDto[]> {
    return await this.dashboardService.findAll(instanceId);
  }

  @Get('/metabase/:instanceId/cards')
  public async getAllCards(
    @Param('instanceId') instanceId: string,
  ): Promise<CardDto[]> {
    const instance = await this.instanceService.findById(instanceId);
    return await this.cardService.findAll(instance);
  }

  @Post('/metabase/check_schemas')
  public async getDatabasesShareSameSchema(
    @Body() databaseSchemaCheckRequest: DatabaseCheckSchemaRequestDto,
  ): Promise<DatabaseSchemaEqualityInterface> {
    return await this.databaseService.getDatabasesShareSameSchema(
      databaseSchemaCheckRequest,
    );
  }

  @Get('/metabase/:instanceName/users')
  public async getAllUsers(
    @Param('instanceName') instanceName: string,
  ): Promise<MetabaseCoreUserDto[]> {
    const instance: InstanceEntity = await this.instanceService.findByName(
      instanceName,
    );
    return await this.metabaseApiService.getAllUsers(instance);
  }

  @Get('/metabase/collection-tree/:instanceId/:collectionId')
  public async getCollectionTree(
    @Param('instanceId') instanceId: string,
    @Param('collectionId') collectionId: number,
  ): Promise<MetabaseCollectionAncestor[]> {
    return await this.metabaseApiService.getCollectionAncestors(
      instanceId,
      collectionId,
    );
  }

  @Get('/metabase/collection-path/:instanceId/:collectionId')
  public async getCollectionPath(
    @Param('instanceId') instanceId: string,
    @Param('collectionId') collectionId: number,
  ): Promise<string> {
    return await this.metabaseApiService.getCollectionPath(
      instanceId,
      collectionId,
    );
  }

  @Post('/metabase/model-with-dependencies')
  public async getWithModelDependency(
    @Body() payload: ModelDependencyRequest,
  ): Promise<ModelWithDependenciesDto> {
    return await this.modelService.getModelWithDepencies(payload);
  }

  @Post('/metabase/model/save')
  public async saveModel(@Body() payload: SaveModelRequestDto): Promise<any> {
    return await this.modelService.saveModel(payload);
  }
}
