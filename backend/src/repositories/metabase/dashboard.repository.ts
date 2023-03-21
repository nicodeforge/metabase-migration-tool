import { Injectable } from '@nestjs/common';
import { MetabaseAuthService } from '../../services/metabase-auth.service';
import { ApiQueryService } from '../../services/api-query.service';

import { DashboardDto } from '../../dto/metabase/dashboard.dto';
import { InstanceEntity } from '../../instance/instance.entity';

@Injectable()
export class DashboardRepository {
  constructor(
    private readonly auth: MetabaseAuthService,
    private readonly apiQueryService: ApiQueryService,
  ) {}

  public async findOneById(
    instance: InstanceEntity,
    dashboardId: number,
  ): Promise<DashboardDto> {
    const metabase = await this.auth.getMetabaseInstanceV2(instance);
    const endpoint = `${metabase.url}/api/dashboard/${dashboardId}`;

    return await this.apiQueryService.processGetRequest(
      endpoint,
      metabase.token,
    );
  }

  public async findAll(instance: InstanceEntity): Promise<DashboardDto[]> {
    const metabase = await this.auth.getMetabaseInstanceV2(instance);
    const endpoint = `${metabase.url}/api/dashboard/`;
    return await this.apiQueryService.processGetRequest(
      endpoint,
      metabase.token,
    );
  }

  public async save(
    instance: InstanceEntity,
    dashboard: DashboardDto,
  ): Promise<DashboardDto> {
    const metabase = await this.auth.getMetabaseInstanceV2(instance);
    const endpoint = `${metabase.url}/api/dashboard/`;
    const payload = {
      name: dashboard.name,
      description: dashboard.description,
      parameters: dashboard.parameters,
      cache_ttl: dashboard.cache_ttl,
      collection_id: dashboard.collection_id,
      collection_position: dashboard.collection_position,
    };
    return await this.apiQueryService.processPostReqest(
      endpoint,
      payload,
      metabase.token,
    );
  }

  public async enableEmbedding(
    instance: InstanceEntity,
    dashboard: DashboardDto,
  ): Promise<DashboardDto> {
    const metabase = await this.auth.getMetabaseInstanceV2(instance);
    const endpoint = `${metabase.url}/api/dashboard/${dashboard.id}`;
    const payload = {
      enable_embedding: true,
    };

    await this.apiQueryService.processPutRequest(
      endpoint,
      payload,
      metabase.token,
    );

    const paramPayload = {
      embedding_params: dashboard.embedding_params,
    };

    return await this.apiQueryService.processPutRequest(
      endpoint,
      paramPayload,
      metabase.token,
    );
  }
}
