import { Injectable } from '@nestjs/common';
import { MetabaseAuthService } from '../../services/metabase-auth.service';
import { ApiQueryService } from '../../services/api-query.service';
import { FieldDto } from '../../dto/metabase/field.dto';
import { InstanceEntity } from '../../instance/instance.entity';

@Injectable()
export class FieldRepository {
  constructor(
    private readonly auth: MetabaseAuthService,
    private readonly apiQueryService: ApiQueryService,
  ) {}

  public async findOneById(
    instance: InstanceEntity,
    fieldId: number,
  ): Promise<FieldDto> {
    const metabase = await this.auth.getMetabaseInstanceV2(instance);
    const endpoint = `${metabase.url}/api/field/${fieldId}`;

    return await this.apiQueryService.processGetRequest(
      endpoint,
      metabase.token,
    );
  }
}
