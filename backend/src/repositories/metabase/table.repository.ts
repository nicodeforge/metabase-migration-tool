import { Injectable } from '@nestjs/common';
import { MetabaseAuthService } from '../../services/metabase-auth.service';
import { ApiQueryService } from '../../services/api-query.service';
import { TableDto } from '../../dto/metabase/table.dto';
import { InstanceEntity } from '../../instance/instance.entity';

@Injectable()
export class TableRepository {
  constructor(
    private readonly auth: MetabaseAuthService,
    private readonly apiQueryService: ApiQueryService,
  ) {}

  public async getTable(
    instance: InstanceEntity,
    tableId: number,
  ): Promise<TableDto> {
    const metabase = await this.auth.getMetabaseInstanceV2(instance);
    const endpoint = `${metabase.url}/api/table/${tableId}?include=fields`;

    return await this.apiQueryService.processGetRequest(
      endpoint,
      metabase.token,
    );
  }
  public async getAllTables(instance: InstanceEntity): Promise<TableDto[]> {
    const metabase = await this.auth.getMetabaseInstanceV2(instance);
    const endpoint = `${metabase.url}/api/table/`;

    return await this.apiQueryService.processGetRequest(
      endpoint,
      metabase.token,
    );
  }

  public async getTableRelations(
    instance: InstanceEntity,
    tableId: number,
  ): Promise<TableDto[]> {
    const metabase = await this.auth.getMetabaseInstanceV2(instance);
    const endpoint = `${metabase.url}/api/table/${tableId}/related`;
    return await this.apiQueryService.processGetRequest(
      endpoint,
      metabase.token,
    );
  }
}
