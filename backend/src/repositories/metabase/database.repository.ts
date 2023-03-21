import { Injectable } from '@nestjs/common';
import { DatabaseInfoDto } from '../../dto/metabase/database-info.dto';
import { TableDto } from '../../dto/metabase/table.dto';
import { MetabaseAuthService } from '../../services/metabase-auth.service';
import { ApiQueryService } from '../../services/api-query.service';
import { InstanceEntity } from '../../instance/instance.entity';

@Injectable()
export class DatabaseRepository {
  constructor(
    private readonly auth: MetabaseAuthService,
    private readonly apiQueryService: ApiQueryService,
  ) {}
  public async findOneById(
    instance: InstanceEntity,
    databaseId: number,
  ): Promise<DatabaseInfoDto> {
    const metabase = await this.auth.getMetabaseInstanceV2(instance);

    const endpoint =
      metabase.url + '/api/database/' + databaseId + '?include=tables.fields';
    return await this.apiQueryService.processGetRequest(
      endpoint,
      metabase.token,
    );
  }

  public async findAll(instance: InstanceEntity): Promise<DatabaseInfoDto> {
    const metabase = await this.auth.getMetabaseInstanceV2(instance);
    const endpoint = `${metabase.url}/api/database/`;

    return await this.apiQueryService.processGetRequest(
      endpoint,
      metabase.token,
    );
  }

  public async getDatabaseSchema(
    instance: InstanceEntity,
    databaseId: number,
  ): Promise<TableDto[]> {
    const metabase = await this.auth.getMetabaseInstanceV2(instance);

    const endpoint = `${metabase.url}/api/database/${databaseId}/schema/`;

    return await this.apiQueryService.processGetRequest(
      endpoint,
      metabase.token,
    );
  }
}
