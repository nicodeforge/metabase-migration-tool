import { Injectable } from '@nestjs/common';
import { MetabaseAuthService } from '../../services/metabase-auth.service';
import { ApiQueryService } from '../../services/api-query.service';
import { MetabaseCoreUserDto } from '../../dto/metabase/metabase-core-user.dto';
import { InstanceEntity } from '../../instance/instance.entity';

@Injectable()
export class MetabaseUserRepository {
  constructor(
    private readonly auth: MetabaseAuthService,
    private readonly apiQueryService: ApiQueryService,
  ) {}
  public async findOneById(
    instance: InstanceEntity,
    userId: number,
  ): Promise<MetabaseCoreUserDto> {
    const metabase = await this.auth.getMetabaseInstanceV2(instance);
    const endpoint = `${metabase.url}/api/user/${userId}`;

    return await this.apiQueryService.processGetRequest(
      endpoint,
      metabase.token,
    );
  }
  public async findAll(
    instance: InstanceEntity,
  ): Promise<MetabaseCoreUserDto[]> {
    const metabase = await this.auth.getMetabaseInstanceV2(instance);
    const endpoint = `${metabase.url}/api/user?status=all`;

    const response = await this.apiQueryService.processGetRequest(
      endpoint,
      metabase.token,
    );
    //User endpoint nests 2 dashboard objects on metabase 0.45
    return response.data;
  }
}
