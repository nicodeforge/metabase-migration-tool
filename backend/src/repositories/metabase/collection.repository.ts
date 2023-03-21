import { MetabaseAuthService } from '../../services/metabase-auth.service';
import { ApiQueryService } from '../../services/api-query.service';
import { Injectable } from '@nestjs/common';
import { MetabaseCollectionDto } from '../../dto/metabase/metabase-collection.dto';
import { InstanceEntity } from '../../instance/instance.entity';

@Injectable()
export class CollectionRepository {
  constructor(
    private readonly auth: MetabaseAuthService,
    private readonly apiQueryService: ApiQueryService,
  ) {}

  public async findOneById(
    instance: InstanceEntity,
    collectionId: number | 'root',
  ): Promise<any> {
    const metabase = await this.auth.getMetabaseInstanceV2(instance);

    const endpoint = `${metabase.url}/api/collection/${collectionId}`;

    const collection = await this.apiQueryService.processGetRequest(
      endpoint,
      metabase.token,
    );

    collection.path = this.computePath(collection);

    return collection;
  }

  public async findBy(
    instance: InstanceEntity,
    property: any,
    value: any,
  ): Promise<MetabaseCollectionDto[]> {
    const collections = await this.findAll(instance);
    return collections.filter(
      (collection) => collection[`${property}`] == value,
    );
  }

  public async findAll(instance: InstanceEntity) {
    const metabase = await this.auth.getMetabaseInstanceV2(instance);
    const endpoint = `${metabase.url}/api/collection/`;

    let collections: MetabaseCollectionDto[] =
      await this.apiQueryService.processGetRequest(endpoint, metabase.token);

    collections = await Promise.all(
      collections.map(
        async (collection) => await this.findOneById(instance, collection.id),
      ),
    );

    return collections;
  }

  private computePath(collection: MetabaseCollectionDto): string {
    const ancestors = collection.effective_ancestors;
    let path = '';
    ancestors.forEach((coll) => {
      const displayName = coll.id === 'root' ? 'root' : coll.name;
      path += displayName + '>';
    });
    return path.slice(0, -1);
  }

  public async save(
    instance: InstanceEntity,
    collection: MetabaseCollectionDto,
  ): Promise<MetabaseCollectionDto> {
    const metabase = await this.auth.getMetabaseInstanceV2(instance);

    const endpoint = `${metabase.url}/api/collection/`;

    const payload = {
      name: collection.name,
      color: '#509EE3',
      parent_id: collection?.parent_id,
    };

    return await this.apiQueryService.processPostReqest(
      endpoint,
      payload,
      metabase.token,
    );
  }
}
