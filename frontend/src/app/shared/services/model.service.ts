import { Injectable } from '@angular/core';
import { ModelDependencyRequest } from '../components/dependency-mapping/model-dependency.request';
import {
  MetabaseModelTypeEnum,
  ModelWithDependenciesDto,
} from '../../feature/duplicate-dashboard/dto/model-with-dependencies.dto';
import { ModelRepository } from '../repositories/model.repository';
import { Observable } from 'rxjs';
import { DatabaseCheckSchemaRequest } from '../../feature/duplicate-dashboard/components/copy-dashboard-across-instance/database-check-schema.request';
import { DatabaseSchemaEqualityInterface } from '../../feature/duplicate-dashboard/repositories/database-schema-equality.interface';
import { CreateModelDto } from '../repositories/create-model.dto';
import { ApiDashboardDto } from '../../feature/duplicate-dashboard/api-dto/api-dashboard.dto';
import { ApiCardDto } from '../../feature/duplicate-dashboard/api-dto/api-card.dto';
import { ApiDashcardDto } from '../../feature/duplicate-dashboard/api-dto/api-dashcard.dto';
import { MetabaseCollectionDependencyModel } from '../../feature/duplicate-dashboard/models/metabase-collection-dependency.model';
import { ApiCollectionDto } from '../../feature/duplicate-dashboard/api-dto/api-collection.dto';
import { CreateModelRequestDto } from '../repositories/create-model-request.dto';

@Injectable({
  providedIn: 'root',
})
export class ModelService {
  constructor(private modelRepository: ModelRepository) {}

  public getModelWithDependencies(
    modelDependencyRequest: ModelDependencyRequest
  ): Observable<ModelWithDependenciesDto> {
    console.log('getModelDependencies-serv');

    return this.modelRepository.getModelWithDependencies(
      modelDependencyRequest
    );
  }

  public async getDatabasesSchemasAreSame(
    databaseSchemaCheckRequest: DatabaseCheckSchemaRequest
  ): Promise<DatabaseSchemaEqualityInterface> {
    return await this.modelRepository.getDatabasesSchemasAreSame(
      databaseSchemaCheckRequest
    );
  }

  public getModelToCreate(
    model: ModelWithDependenciesDto,
    modelType: MetabaseModelTypeEnum
  ): CreateModelDto {
    let destinationModel!: ApiDashboardDto | ApiCardDto;

    destinationModel = this.updateModelEntity(model);

    if (modelType === MetabaseModelTypeEnum.DASHBOARD) {
      destinationModel = destinationModel as ApiDashboardDto;

      destinationModel.ordered_cards = this.updateDashcardEntities(
        model,
        destinationModel.ordered_cards
      ) as ApiDashcardDto[];
    }

    if (modelType === MetabaseModelTypeEnum.CARD) {
      destinationModel = destinationModel as ApiCardDto;

      destinationModel = this.updateDatabaseEntity(
        model,
        destinationModel
      ) as ApiCardDto;
    }

    const destinationCollections = this.updateCollectionsEntity(
      model.dependencies.collections
    );

    return {
      type: modelType,
      model: destinationModel,
      collections: destinationCollections,
    };
  }

  private updateModelEntity(
    model: ModelWithDependenciesDto
  ): ApiDashboardDto | ApiCardDto {
    const { origin } = model;

    model.dependencies.users.forEach((user) => {
      if (user.origin.id === model.origin.creator_id) {
        origin.creator_id = user.destination.id;
      }

      if (user.origin.id === model.origin.made_public_by_id) {
        origin.made_public_by_id = user.destination.id;
      }
    });

    model.dependencies.collections.forEach((collection) => {
      if (
        collection.origin.id === model.origin.collection_id &&
        collection.existsInDestination
      ) {
        origin.collection_id = collection.destination.id;
      }
    });
    return origin;
  }
  private updateDashcardEntities(
    model: ModelWithDependenciesDto,
    dashcards: ApiDashcardDto[]
  ): ApiDashcardDto[] {
    for (let dashcard of dashcards) {
      const originalCollectionId = dashcard.card.collection_id;

      const destinationCollection = model.dependencies.collections.find(
        (coll) => coll.origin.id === originalCollectionId
      );
      if (
        destinationCollection?.destination?.id &&
        destinationCollection.existsInDestination
      ) {
        dashcard.card.collection_id = destinationCollection.destination.id;
      }

      const originalDatabaseID = dashcard.card.database_id;

      const destinationDatabase = model.dependencies.databases.find(
        (db) => db.origin.id === originalDatabaseID
      );

      if (destinationDatabase?.destination.id) {
        dashcard.card.database_id = destinationDatabase.destination.id;
        dashcard.card.dataset_query.database =
          destinationDatabase.destination.id;
      }

      const originalCreatorId = dashcard.card.creator_id;

      const destinationCreator = model.dependencies.users.find(
        (u) => u.origin.id === originalCreatorId
      );

      if (destinationCreator?.destination.id) {
        dashcard.card.creator_id = destinationCreator.destination.id;
      }

      const originalPublisherId = dashcard.card.made_public_by_id;

      const destinationPublisher = model.dependencies.users.find(
        (u) => u.origin.id === originalPublisherId
      );

      if (destinationPublisher?.destination.id) {
        dashcard.card.made_public_by_id = destinationPublisher.destination.id;
      }
    }
    return dashcards;
  }

  private updateDatabaseEntity(
    model: ModelWithDependenciesDto,
    card: ApiCardDto
  ): ApiCardDto {
    const originalDatabaseID = card.database_id;

    const destinationDatabase = model.dependencies.databases.find(
      (db) => db.origin.id === originalDatabaseID
    );

    if (destinationDatabase?.destination.id) {
      card.database_id = destinationDatabase.destination.id;
      card.dataset_query.database = destinationDatabase.destination.id;
    }

    return card;
  }

  protected updateCollectionsEntity(
    originCollections: MetabaseCollectionDependencyModel[]
  ): ApiCollectionDto[] {
    const collections: ApiCollectionDto[] = [];

    originCollections.forEach((collection) => {
      if (collection?.createInDestination) {
        //TODO Fix : find will stop on first match but many collections can share the same name.
        const parentCollection = originCollections.find(
          (coll) => coll.origin.id === collection.origin.parent_id
        );

        const parent_id = this.getParentCollectionId(
          collection,
          parentCollection
        );

        collections.push({
          id: collection.origin.id,
          name: collection.origin.name,
          slug: collection.origin.slug,
          parent_id: parent_id,
          location: collection.origin.location,
          color: '#509EE3',
          toCreate: true,
        });
      } else {
        collections.push({
          id: collection.destination.id,
          name: collection.destination.name,
          slug: collection.destination.slug,
          parent_id: collection.destination.parent_id,
          location: collection.destination.location,
          color: '#509EE3',
          toCreate: false,
        });
      }
    });
    collections.filter((n) => n);
    console.log(collections);
    return collections;
  }

  protected getParentCollectionId(
    collection: MetabaseCollectionDependencyModel,
    parentCollection: MetabaseCollectionDependencyModel | undefined
  ): number | 'root' {
    if (typeof parentCollection === 'undefined') {
      console.log('Search for parent is undefined');
      return collection.origin.parent_id;
    }

    if (parentCollection.existsInDestination) {
      console.log('Parent collection exists in destination');
      return parentCollection.destination.id;
    }

    console.log('Parent collection does not exists in destination');
    return parentCollection.origin.id;
  }

  public saveModel(saveModelRequest: CreateModelRequestDto): Observable<any> {
    return this.modelRepository.saveModel(saveModelRequest);
  }
}
