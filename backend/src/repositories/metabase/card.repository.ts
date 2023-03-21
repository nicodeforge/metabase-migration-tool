import { Injectable } from '@nestjs/common';
import { MetabaseAuthService } from '../../services/metabase-auth.service';
import { ApiQueryService } from '../../services/api-query.service';
import { CardDto } from '../../dto/metabase/card.dto';
import { InstanceEntity } from '../../instance/instance.entity';

@Injectable()
export class CardRepository {
  constructor(
    private readonly auth: MetabaseAuthService,
    private readonly apiQueryService: ApiQueryService,
  ) {}

  public async findOneById(
    instance: InstanceEntity,
    cardId: number,
  ): Promise<CardDto> {
    const metabase = await this.auth.getMetabaseInstanceV2(instance);
    const endpoint = `${metabase.url}/api/card/${cardId}`;

    return await this.apiQueryService.processGetRequest(
      endpoint,
      metabase.token,
    );
  }

  public async findAll(instance: InstanceEntity): Promise<CardDto[]> {
    const metabase = await this.auth.getMetabaseInstanceV2(instance);
    const endpoint = `${metabase.url}/api/card/`;

    return await this.apiQueryService.processGetRequest(
      endpoint,
      metabase.token,
    );
  }

  async save(instance: InstanceEntity, card: CardDto): Promise<CardDto> {
    const metabase = await this.auth.getMetabaseInstanceV2(instance);
    const endpoint = `${metabase.url}/api/card/`;

    const payload = {
      visualization_settings: card.visualization_settings,
      parameters: card.parameters,
      parameter_mappings: card.parameter_mappings,
      description: card.description,
      collection_position: card.collection_position,
      collection_id: card.collection_id,
      name: card.name,
      dataset_query: card.dataset_query,
      display: card.display,
      result_metadata: card.result_metadata,
    };
    return await this.apiQueryService.processPostReqest(
      endpoint,
      payload,
      metabase.token,
    );
  }
}
