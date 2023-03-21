import { Injectable } from '@nestjs/common';
import { InstanceEntity } from '../instance/instance.entity';
import { ModelWithDependenciesDto } from '../dto/app/model-with-dependencies.dto';
import { MetabaseCollectionDependencyModel } from '../models/metabase-collection-dependency.model';
import { MetabaseCollectionDto } from '../dto/metabase/metabase-collection.dto';
import { DashcardDto } from '../dto/metabase/dashcard.dto';
import { MetabaseApiService } from './metabase-api.service';
import { CollectionRepository } from '../repositories/metabase/collection.repository';
import { UtilsService } from './utils.service';
import { MetabaseModelTypeEnum } from '../controllers/metabase-model-type.enum';
import { MetabaseEntityMapping } from '../models/metabase-entity-mapping';
import { CreateModelDto } from '../dto/app/save-model-request.dto';
import { DashboardDto } from '../dto/metabase/dashboard.dto';

@Injectable()
export class CollectionService {
  constructor(
    private readonly metabaseApiService: MetabaseApiService,
    private readonly collectionRepository: CollectionRepository,
    private readonly utils: UtilsService,
  ) {}
  public async getCollectionDependencies(
    originInstance: InstanceEntity,
    modelWithDependencies: ModelWithDependenciesDto,
  ): Promise<MetabaseCollectionDependencyModel[]> {
    const collections: MetabaseCollectionDependencyModel[] = [];

    const modelCollection: MetabaseCollectionDependencyModel = {
      origin: null,
      existsInDestination: null,
      destination: null,
    };

    const originCollections: MetabaseCollectionDto[] =
      await this.collectionRepository.findAll(originInstance);

    if (modelWithDependencies.origin?.collection_id) {
      modelCollection.origin = originCollections.find(
        (collection) =>
          collection.id === modelWithDependencies.origin.collection_id,
      );

      if (!this.utils.isObjectInArray(modelCollection, collections)) {
        collections.push(modelCollection);
      }
    }

    if (modelWithDependencies.type === MetabaseModelTypeEnum.DASHBOARD) {
      const cardsCollections: MetabaseCollectionDependencyModel[] =
        this.getDashcardsCollections(
          modelWithDependencies.origin['ordered_cards'],
          originCollections,
        );
      cardsCollections.forEach((collection) => {
        if (!this.utils.isObjectInArray(collection, collections)) {
          collections.push(collection);
        }
      });
    }

    for (let i = 0; i < collections.length; i++) {
      const search = collections.find(
        (c) => c.origin?.id === collections[i].origin?.parent_id,
      );

      if (typeof search === 'undefined' && collections[i].origin?.parent_id) {
        const childCollection = await this.metabaseApiService.getCollection(
          originInstance,
          collections[i].origin.id,
        );

        const parentCollection = await this.getParentCollection(
          originInstance,
          childCollection,
        );

        collections.push({
          origin: parentCollection,
          existsInDestination: null,
          destination: null,
        });

        i = 0;
      }
    }

    return collections;
  }
  private async getParentCollection(
    instance: InstanceEntity,
    collection: MetabaseCollectionDto,
  ): Promise<MetabaseCollectionDto | null> {
    if (typeof collection?.parent_id === 'number') {
      return await this.metabaseApiService.getCollection(
        instance,
        collection.parent_id,
      );
    } else {
      return null;
    }
  }

  private getDashcardsCollections(
    dashcards: DashcardDto[],
    originCollections: MetabaseCollectionDto[],
  ): MetabaseCollectionDependencyModel[] {
    const collections: MetabaseCollectionDependencyModel[] = [];

    for (let i = 0; i < dashcards.length; i++) {
      const dashcardCollection: MetabaseCollectionDependencyModel = {
        origin: null,
        existsInDestination: null,
        destination: null,
      };

      if (dashcards[i].card?.collection_id) {
        dashcardCollection.origin = originCollections.find(
          (collection) => collection.id === dashcards[i].card.collection_id,
        );

        if (!this.utils.isObjectInArray(dashcardCollection, collections)) {
          collections.push(dashcardCollection);
        }
      }
    }

    return collections;
  }

  public async getCollectionsExistInDestination(
    collections: MetabaseCollectionDependencyModel[],
    destinationInstance: InstanceEntity,
  ) {
    const destinationCollections: MetabaseCollectionDto[] =
      await this.metabaseApiService.getAllCollections(destinationInstance);

    for (const collection of collections) {
      if (collection?.origin?.id) {
        let destinationCollection!: MetabaseCollectionDto;

        const originCollectionsInDestination: MetabaseCollectionDto[] =
          destinationCollections.filter(
            (coll) =>
              coll.name === collection.origin.name &&
              coll.path === collection.origin.path,
          );

        if (destinationCollections.length > 1) {
          for (const destinationColl of originCollectionsInDestination) {
            const collectionParentIsSame: boolean =
              this.collectionParentIsSameInOriginAndDestination(
                destinationCollections,
                destinationColl,
                collections,
                collection,
              );
            if (collectionParentIsSame) {
              destinationCollection = destinationColl;
              collection.existsInDestination = true;
            }
          }
        }
        if (originCollectionsInDestination.length === 1) {
          destinationCollection = originCollectionsInDestination[0];
          collection.existsInDestination = true;
        }

        if (originCollectionsInDestination.length === 0) {
          collection.existsInDestination = false;
        }

        if (
          collection.existsInDestination &&
          collection.origin.parent_id != null
        ) {
          collection.existsInDestination =
            this.collectionParentIsSameInOriginAndDestination(
              destinationCollections,
              destinationCollection,
              collections,
              collection,
            );
        }

        if (collection.existsInDestination) {
          collection.destination = destinationCollection;
        } else {
          collection.destination = {
            id: null,
            name: null,
            location: null,
            color: null,
            slug: null,
            parent_id: null,
          };
        }
      }
    }

    return collections;
  }

  private collectionParentIsSameInOriginAndDestination(
    destinationCollections: MetabaseCollectionDto[],
    destinationCollection: MetabaseCollectionDto,
    originCollections: MetabaseCollectionDependencyModel[],
    originCollection: MetabaseCollectionDependencyModel,
  ): boolean {
    const destinationCollectionParentCollection = destinationCollections.find(
      (collectionSearch) =>
        collectionSearch.id === destinationCollection.parent_id,
    );

    const originCollectionParentCollection = originCollections.find(
      (coll) => coll.origin.id === originCollection.origin.parent_id,
    );

    return (
      typeof destinationCollectionParentCollection != 'undefined' &&
      typeof originCollectionParentCollection != 'undefined'
    );
  }

  public async saveCollections(
    instance: InstanceEntity,
    model: CreateModelDto,
  ): Promise<CreateModelDto> {
    model.collections = this.utils.sortArrayByObjectId(model.collections);

    for (let i = 0; i < model.collections.length; i++) {
      if (model.collections[i].toCreate) {
        const collectionMapping: MetabaseEntityMapping = {
          originalId: model.collections[i].id,
          newId: null,
        };

        model.collections[i] = await this.collectionRepository.save(
          instance,
          model.collections[i],
        );

        collectionMapping.newId = model.collections[i].id;

        model.collections = this.updateCollectionParent(
          model.collections,
          collectionMapping,
        );

        model = this.updateCollectionInEntities(model, collectionMapping);
      } else {
        const collectionMapping: MetabaseEntityMapping = {
          originalId: model.collections[i].id,
          newId: model.collections[i].id,
        };

        model.collections = this.updateCollectionParent(
          model.collections,
          collectionMapping,
        );
      }
    }
    return model;
  }

  private updateCollectionInEntities(
    model: CreateModelDto,
    collectionMapping: MetabaseEntityMapping,
  ): CreateModelDto {
    if (model.model.collection_id === collectionMapping.originalId) {
      model.model.collection_id = collectionMapping.newId;
    }

    if (
      model.type === MetabaseModelTypeEnum.DASHBOARD &&
      model.model instanceof DashboardDto
    ) {
      model.model.ordered_cards.forEach((dashCard) => {
        if (dashCard.card.collection_id === collectionMapping.originalId) {
          dashCard.card.collection_id = collectionMapping.newId;
        }
      });
    } else {
      if (model.model.collection_id === collectionMapping.originalId) {
        model.model.collection_id = collectionMapping.newId;
      }
    }

    return model;
  }

  private updateCollectionParent(
    collections: MetabaseCollectionDto[],
    collectionMapping: MetabaseEntityMapping,
  ): MetabaseCollectionDto[] {
    collections.forEach((collection) => {
      if (collection.parent_id === collectionMapping.originalId) {
        collection.parent_id = collectionMapping.newId;
      }
    });

    return collections;
  }
}
