import { Injectable } from '@angular/core';
import { DuplicateDashboardRepository } from '../repositories/duplicate-dashboard.repository';
import { ApiDashboardWithDependenciesDto } from '../api-dto/api-dashboard-with-dependencies.dto';
import { CreateApiDashboardDto } from '../api-dto/create-api-dashboard.dto';
import { ApiDashboardDto } from '../api-dto/api-dashboard.dto';
import { ApiCollectionDto } from '../api-dto/api-collection.dto';
import { ApiDashcardDto } from '../api-dto/api-dashcard.dto';
import { Observable } from 'rxjs';
import { MetabaseCollectionDependencyModel } from '../models/metabase-collection-dependency.model';
import { DashboardDependencyRequest } from '../repositories/dashboard-dependency.request';
import { SaveDashboardRequest } from '../repositories/save-dashboard.request';
import { DatabaseCheckSchemaRequest } from '../components/copy-dashboard-across-instance/database-check-schema.request';

@Injectable()
export class DuplicateDashboardService {
  constructor(private readonly dashboardRepo: DuplicateDashboardRepository) {}
  public getDashboardDependency(
    payload: DashboardDependencyRequest
  ): Observable<ApiDashboardWithDependenciesDto> {
    return this.dashboardRepo.getDashboardDependency(payload);
  }

  public getDashboardToCreate(
    dashboardWithDependencies: ApiDashboardWithDependenciesDto
  ): CreateApiDashboardDto {
    const destinationDashboard: ApiDashboardDto = this.updateDashboardEntity(
      dashboardWithDependencies
    );

    destinationDashboard.ordered_cards = this.updateDashcardEntities(
      dashboardWithDependencies,
      destinationDashboard.ordered_cards
    );

    const destinationCollections = this.updateCollectionsEntity(
      dashboardWithDependencies.dependencies.collections
    );

    return new CreateApiDashboardDto(
      destinationDashboard,
      destinationCollections
    );
  }

  private updateDashboardEntity(
    dashboardWithDependencies: ApiDashboardWithDependenciesDto
  ): ApiDashboardDto {
    const dashboard: ApiDashboardDto = dashboardWithDependencies.dashboard;

    dashboardWithDependencies.dependencies.users.forEach((user) => {
      if (user.origin.id === dashboardWithDependencies.dashboard.creator_id) {
        dashboard.creator_id = user.destination.id;
      }

      if (
        user.origin.id === dashboardWithDependencies.dashboard.made_public_by_id
      ) {
        dashboard.made_public_by_id = user.destination.id;
      }
    });

    dashboardWithDependencies.dependencies.collections.forEach((collection) => {
      if (
        collection.origin.id ===
          dashboardWithDependencies.dashboard.collection_id &&
        collection.existsInDestination
      ) {
        dashboard.collection_id = collection.destination.id;
      }
    });
    return dashboard;
  }

  private updateCollectionsEntity(
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

  public async saveDashboard(saveDashboardRequest: SaveDashboardRequest) {
    return await this.dashboardRepo.saveDashboard(saveDashboardRequest);
  }

  private updateDashcardEntities(
    dashboardWithDependencies: ApiDashboardWithDependenciesDto,
    ordered_cards: ApiDashcardDto[]
  ): ApiDashcardDto[] {
    /*
     * For each card, we need to update :
     *   - Collection (if it's mapped)
     *   - Database
     *   - Creator ID
     *   - Made public by ID
     * */
    for (let dashcard of ordered_cards) {
      const originalCollectionId = dashcard.card.collection_id;

      const destinationCollection =
        dashboardWithDependencies.dependencies.collections.find(
          (coll) => coll.origin.id === originalCollectionId
        );
      if (
        destinationCollection?.destination?.id &&
        destinationCollection.existsInDestination
      ) {
        dashcard.card.collection_id = destinationCollection.destination.id;
      }

      const originalDatabaseID = dashcard.card.database_id;

      const destinationDatabase =
        dashboardWithDependencies.dependencies.databases.find(
          (db) => db.origin.id === originalDatabaseID
        );

      if (destinationDatabase?.destination.id) {
        dashcard.card.database_id = destinationDatabase.destination.id;
        dashcard.card.dataset_query.database =
          destinationDatabase.destination.id;
      }

      const originalCreatorId = dashcard.card.creator_id;

      const destinationCreator =
        dashboardWithDependencies.dependencies.users.find(
          (u) => u.origin.id === originalCreatorId
        );

      if (destinationCreator?.destination.id) {
        dashcard.card.creator_id = destinationCreator.destination.id;
      }

      const originalPublisherId = dashcard.card.made_public_by_id;

      const destinationPublisher =
        dashboardWithDependencies.dependencies.users.find(
          (u) => u.origin.id === originalPublisherId
        );

      if (destinationPublisher?.destination.id) {
        dashcard.card.made_public_by_id = destinationPublisher.destination.id;
      }
    }
    return ordered_cards;
  }

  public async getAllDashboards(
    instanceId: string
  ): Promise<ApiDashboardDto[]> {
    let dashboards = await this.dashboardRepo.getAllDashboards(instanceId);

    for (const dashboard of dashboards) {
      dashboard.display_label = dashboard.name + ' #' + dashboard.id;
    }

    dashboards = this.sortArrayByObjectId(dashboards);

    return dashboards;
  }

  private sortArrayByObjectId(input: Array<any>): any {
    return input.sort((a, b) => a.id - b.id);
  }

  public async getTest() {
    return await this.dashboardRepo.getTest();
  }

  public async getDatabasesSchemasAreSame(
    databaseSchemaCheckRequest: DatabaseCheckSchemaRequest
  ): Promise<Record<any, any>> {
    return await this.dashboardRepo.getDatabasesSchemasAreSame(
      databaseSchemaCheckRequest
    );
  }

  private getParentCollectionId(
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

    /*if (typeof parentCollection != 'undefined') {
      console.log(
        'Parent collection is defined for collection ' + collection.origin.name,
        parentCollection
      );
      if (parentCollection.existsInDestination) {
        console.log('Parent collection exists in destination');

        parent_id = parentCollection.destination.id;
      } else {
        console.log('Parent collection does not exists in destination');
        parent_id = parentCollection.origin.id;
      }
    } else {
      console.log('Search for parent is undefined');
      parent_id = collection.origin.parent_id;
    }
    return parent_id;*/
  }
}
