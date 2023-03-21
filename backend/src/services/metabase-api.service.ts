import { ConsoleLogger, Injectable } from '@nestjs/common';
import { DashboardDto } from '../dto/metabase/dashboard.dto';
import { DashboardWithDependenciesDto } from '../dto/metabase/dashboard-with-dependencies.dto';
import { DashboardDependencyDto } from '../dto/metabase/dashboard-dependency.dto';
import { MetabaseCollectionDependencyModel } from '../models/metabase-collection-dependency.model';
import {
  MetabaseCollectionAncestor,
  MetabaseCollectionDto,
} from '../dto/metabase/metabase-collection.dto';
import { MetabaseDatabaseDependencyModel } from '../models/metabase-database-dependency.model';
import { TableDto } from '../dto/metabase/table.dto';
import { MetabaseCoreUserDependencyModel } from '../models/metabase-core-user-dependency.model';
import { DatabaseInfoDto } from '../dto/metabase/database-info.dto';
import { CreateDashboardDto } from '../dto/metabase/create-dashboard.dto';
import { MetabaseEntityMapping } from '../models/metabase-entity-mapping';
import { DataSetQuery } from '../dto/metabase/dataset-query.dto';
import { DashcardDto } from '../dto/metabase/dashcard.dto';
import { CardDto } from '../dto/metabase/card.dto';
import { ConfigService } from '@nestjs/config';
import { DatabaseRepository } from '../repositories/metabase/database.repository';
import { CollectionRepository } from '../repositories/metabase/collection.repository';
import { DashboardRepository } from '../repositories/metabase/dashboard.repository';
import { CardRepository } from '../repositories/metabase/card.repository';
import { FieldRepository } from '../repositories/metabase/field.repository';
import { TableRepository } from '../repositories/metabase/table.repository';
import { MetabaseUserRepository } from '../repositories/metabase/metabase-user.repository';
import { DashcardRepository } from '../repositories/metabase/dashcard.repository';
import { MetabaseCoreUserDto } from '../dto/metabase/metabase-core-user.dto';
import { InstanceEntity } from '../instance/instance.entity';
import { InstanceService } from '../instance/instance.service';
import { DashboardService } from './dashboard.service';

@Injectable()
export class MetabaseApiService {
  private step = 0;

  private consoleLogger: ConsoleLogger = new ConsoleLogger();
  constructor(
    private readonly databaseRepository: DatabaseRepository,
    private readonly collectionRepository: CollectionRepository,
    private readonly dashboardRepository: DashboardRepository,
    private readonly cardRepository: CardRepository,
    private readonly fieldRepository: FieldRepository,
    private readonly tableRepository: TableRepository,
    private readonly userRepository: MetabaseUserRepository,
    private readonly dashcardRepository: DashcardRepository,
    private readonly configService: ConfigService,
    private readonly instanceService: InstanceService,
    private readonly dashboardService: DashboardService,
  ) {}

  public async getDashboardWithDependencies(
    originInstance: InstanceEntity,
    destinationInstance: InstanceEntity,
    dashboardId: number,
  ): Promise<DashboardWithDependenciesDto> {
    const dashboardWithDependencies: DashboardWithDependenciesDto =
      new DashboardWithDependenciesDto();

    dashboardWithDependencies.dashboard =
      await this.dashboardService.findOneById(originInstance, dashboardId);

    dashboardWithDependencies.dependencies =
      await this.processUniqueDependencies(
        originInstance,
        dashboardWithDependencies,
      );

    dashboardWithDependencies.dependencies =
      await this.getDependenciesExistInDestination(
        destinationInstance,
        dashboardWithDependencies,
      );

    dashboardWithDependencies.existsInDestination =
      await this.dashboardService.isDashboardExiststingInInstance(
        destinationInstance,
        dashboardWithDependencies.dashboard,
      );

    return dashboardWithDependencies;
  }

  private async processUniqueDependencies(
    instance: InstanceEntity,
    dashboardWithDependencies: DashboardWithDependenciesDto,
  ): Promise<DashboardDependencyDto> {
    const dashboardDependency: DashboardDependencyDto = {
      collections: [],
      databases: [],
      users: [],
    };

    dashboardDependency.collections = await this.getCollectionDependencies(
      instance,
      dashboardWithDependencies,
    );

    dashboardDependency.databases = await this.getDatabaseDependencies(
      instance,
      dashboardWithDependencies,
    );

    dashboardDependency.users = await this.getUserDependencies(
      instance,
      dashboardWithDependencies,
    );

    dashboardDependency.collections = [
      ...new Set(dashboardDependency?.collections),
    ].filter((n) => n);

    dashboardDependency.databases = [
      ...new Set(dashboardDependency?.databases),
    ].filter((n) => n);

    dashboardDependency.users = [...new Set(dashboardDependency?.users)].filter(
      (n) => n,
    );

    return dashboardDependency;
  }

  private async getCollectionDependencies(
    originInstance: InstanceEntity,
    dashboardWithDependencies: DashboardWithDependenciesDto,
  ): Promise<MetabaseCollectionDependencyModel[]> {
    const collections: MetabaseCollectionDependencyModel[] = [];

    const dashboardCollection: MetabaseCollectionDependencyModel = {
      origin: null,
      existsInDestination: null,
      destination: null,
    };

    const originCollections: MetabaseCollectionDto[] =
      await this.collectionRepository.findAll(originInstance);

    if (dashboardWithDependencies.dashboard?.collection_id) {
      dashboardCollection.origin = originCollections.find(
        (collection) =>
          collection.id === dashboardWithDependencies.dashboard.collection_id,
      );

      if (!this.isObjectInArray(dashboardCollection, collections)) {
        collections.push(dashboardCollection);
      }
    }

    const cardsCollections: MetabaseCollectionDependencyModel[] =
      this.getCardsCollections(
        dashboardWithDependencies.dashboard.ordered_cards,
        originCollections,
      );

    cardsCollections.forEach((collection) => {
      if (!this.isObjectInArray(collection, collections)) {
        collections.push(collection);
      }
    });

    for (let i = 0; i < collections.length; i++) {
      const search = collections.find(
        (c) => c.origin?.id === collections[i].origin?.parent_id,
      );

      if (typeof search === 'undefined' && collections[i].origin?.parent_id) {
        const childCollection = await this.getCollection(
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
      return await this.getCollection(instance, collection.parent_id);
    } else {
      return null;
    }
  }

  public async getCollectionAncestors(
    instanceId: string,
    collectionId: number,
  ): Promise<MetabaseCollectionAncestor[]> {
    const instance = await this.instanceService.findById(instanceId);
    const collection = await this.getCollection(instance, collectionId);
    return collection.effective_ancestors;
  }

  public async getCollectionPath(
    instanceId: string,
    collectionId: number,
  ): Promise<string> {
    const ancestors = await this.getCollectionAncestors(
      instanceId,
      collectionId,
    );
    let path = '';
    ancestors.forEach((coll) => {
      path += coll.name + '>';
    });

    return path.slice(0, -1);
  }

  private async getDatabaseDependencies(
    instance: InstanceEntity,
    dashboardWithDependencies: DashboardWithDependenciesDto,
  ): Promise<MetabaseDatabaseDependencyModel[]> {
    const databases: MetabaseDatabaseDependencyModel[] = [];

    const cardDatabases: MetabaseDatabaseDependencyModel[] = [];

    for (
      let i = 0;
      i < dashboardWithDependencies.dashboard.ordered_cards.length;
      i++
    ) {
      if (
        dashboardWithDependencies.dashboard.ordered_cards[i].card.database_id
      ) {
        const cardDatabase: MetabaseDatabaseDependencyModel = {
          origin: null,
          existsInDestination: null,
          destination: null,
        };

        cardDatabase.origin = await this.databaseRepository.findOneById(
          instance,
          dashboardWithDependencies.dashboard.ordered_cards[i].card.database_id,
        );

        const alreadyInArray = cardDatabases.find(
          (db) => db.origin.id === cardDatabase.origin.id,
        );
        if (typeof alreadyInArray === 'undefined') {
          cardDatabases.push(cardDatabase);
        }
      }
    }

    databases.push(...cardDatabases);

    return databases;
  }

  private isObjectInArray(object: any, array: Array<any>): boolean {
    const objectString = JSON.stringify(object);
    const result = [];
    array.forEach((obj) => result.push(JSON.stringify(obj) === objectString));
    return result.includes(true);
  }

  public async getDatabaseInfo(instance, databaseId): Promise<DatabaseInfoDto> {
    return await this.databaseRepository.findOneById(instance, databaseId);
  }

  private async getUserDependencies(
    originInstance: InstanceEntity,
    dashboardWithDependencies: DashboardWithDependenciesDto,
  ): Promise<MetabaseCoreUserDependencyModel[]> {
    const users: MetabaseCoreUserDependencyModel[] = [];

    const destinationUsersIncludingInactive: MetabaseCoreUserDto[] =
      await this.userRepository.findAll(originInstance);

    const dashboardUser: MetabaseCoreUserDependencyModel = {
      origin: null,
      existsInDestination: null,
      destination: null,
    };

    dashboardUser.origin = destinationUsersIncludingInactive.find(
      (user) => user.id === dashboardWithDependencies.dashboard.creator_id,
    );

    const dashboardPublisher: MetabaseCoreUserDependencyModel = {
      origin: null,
      existsInDestination: null,
      destination: null,
    };

    if (dashboardWithDependencies.dashboard.made_public_by_id) {
      destinationUsersIncludingInactive.find(
        (user) =>
          user.id === dashboardWithDependencies.dashboard.made_public_by_id,
      );
    }

    const cardCreators: MetabaseCoreUserDependencyModel[] = [];
    const cardPublishers: MetabaseCoreUserDependencyModel[] = [];

    for (
      let i = 0;
      i < dashboardWithDependencies.dashboard.ordered_cards.length;
      i++
    ) {
      const cardCreator: MetabaseCoreUserDependencyModel = {
        origin: null,
        existsInDestination: null,
        destination: null,
      };
      const cardPublisher: MetabaseCoreUserDependencyModel = {
        origin: null,
        existsInDestination: null,
        destination: null,
      };

      if (
        dashboardWithDependencies.dashboard.ordered_cards[i].card.creator_id
      ) {
        cardCreator.origin = destinationUsersIncludingInactive.find(
          (user) =>
            user.id ===
            dashboardWithDependencies.dashboard.ordered_cards[i].card
              .creator_id,
        );
      }

      if (
        dashboardWithDependencies.dashboard.ordered_cards[i].card
          ?.made_public_by_id
      ) {
        cardPublisher.origin = destinationUsersIncludingInactive.find(
          (user) =>
            user.id ===
            dashboardWithDependencies.dashboard.ordered_cards[i].card
              ?.made_public_by_id,
        );
      }

      if (cardCreator.origin?.id) {
        const alreadyInArray = cardCreators.find(
          (item) => item.origin.id === cardCreator.origin.id,
        );
        if (typeof alreadyInArray === 'undefined') {
          cardCreators.push(cardCreator);
        }
      }

      if (cardPublisher.origin?.id) {
        const alreadyInArray = cardPublishers.find(
          (item) => item.origin.id === cardPublisher.origin.id,
        );
        if (typeof alreadyInArray === 'undefined') {
          cardPublishers.push(cardPublisher);
        }
      }
    }

    let alreadyInArray = users.find(
      (item) => item.origin.id === dashboardUser.origin.id,
    );
    if (typeof alreadyInArray === 'undefined') {
      users.push(dashboardUser);
    }

    if (dashboardPublisher.origin?.id) {
      alreadyInArray = users.find(
        (item) => item.origin.id === dashboardPublisher.origin.id,
      );
      if (typeof alreadyInArray === 'undefined') {
        users.push(dashboardPublisher);
      }
    }

    cardCreators.forEach((cardCreator) => {
      if (cardCreator.origin?.id) {
        alreadyInArray = users.find(
          (item) => item.origin.id === cardCreator.origin.id,
        );
        if (typeof alreadyInArray === 'undefined') {
          users.push(cardCreator);
        }
      }
    });

    cardPublishers.forEach((cardPublisher) => {
      if (cardPublisher.origin?.id) {
        alreadyInArray = users.find(
          (item) => item.origin.id === cardPublisher.origin.id,
        );
        if (typeof alreadyInArray === 'undefined') {
          users.push(cardPublisher);
        }
      }
    });

    return users;
  }

  public async getDependenciesExistInDestination(
    destinationInstance: InstanceEntity,
    dashboardWithDependencies: DashboardWithDependenciesDto,
  ): Promise<DashboardDependencyDto> {
    dashboardWithDependencies.dependencies.collections =
      await this.getCollectionsExistInDestination(
        dashboardWithDependencies.dependencies.collections,
        destinationInstance,
      );

    dashboardWithDependencies.dependencies.databases =
      await this.getDatabasesExistInDestination(
        dashboardWithDependencies.dependencies.databases,
        destinationInstance,
      );

    dashboardWithDependencies.dependencies.users =
      await this.getUsersExistInDestination(
        dashboardWithDependencies.dependencies.users,
        destinationInstance,
      );

    return dashboardWithDependencies.dependencies;
  }

  public async getCollection(
    instance: InstanceEntity,
    collectionId: number | 'root',
  ): Promise<MetabaseCollectionDto> {
    return await this.collectionRepository.findOneById(instance, collectionId);
  }

  public async getAllCollections(
    instance: InstanceEntity,
  ): Promise<MetabaseCollectionDto[]> {
    return await this.collectionRepository.findAll(instance);
  }

  public async getUser(instance: InstanceEntity, userId: number): Promise<any> {
    return await this.userRepository.findOneById(instance, userId);
  }

  public async getAllUsers(
    instance: InstanceEntity,
  ): Promise<MetabaseCoreUserDto[]> {
    return await this.userRepository.findAll(instance);
  }

  private async getCollectionsExistInDestination(
    collections: MetabaseCollectionDependencyModel[],
    destinationInstance: InstanceEntity,
  ): Promise<MetabaseCollectionDependencyModel[]> {
    const destinationCollections: MetabaseCollectionDto[] =
      await this.getAllCollections(destinationInstance);

    for (const collection of collections) {
      if (collection?.origin?.id) {
        let destinationCollection!: MetabaseCollectionDto;

        const originCollectionsInDestination: MetabaseCollectionDto[] =
          destinationCollections.filter(
            (coll) =>
              coll.name === collection.origin.name &&
              coll.path === collection.origin.path,
          );

        //TODO : Name is not unique. Multiple collections can share the same name, with different parents/
        // To ExistInDestination, a collection should have the same name, and its parent should have the same name.
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

  private async getDatabasesExistInDestination(
    databases: MetabaseDatabaseDependencyModel[],
    destinationInstance: InstanceEntity,
  ): Promise<MetabaseDatabaseDependencyModel[]> {
    for (const database of databases) {
      if (database?.origin?.id) {
        const destinationDatabase = await this.getDatabaseInfo(
          destinationInstance,
          database.origin.id,
        );

        database.destination = destinationDatabase;

        const databasesShareSameSchema: boolean =
          this.areDatabasesSharingSameSchema(
            database.origin?.tables,
            database.destination?.tables,
          );

        database.existsInDestination =
          destinationDatabase?.id === database.origin.id &&
          destinationDatabase?.name == database.origin.name &&
          databasesShareSameSchema === true;

        if (database.existsInDestination) {
          database.destination = destinationDatabase;
        } else {
          database.destination = {
            id: null,
            name: null,
          };
        }
      }
    }

    return databases;
  }

  private areDatabasesSharingSameSchema(
    originSchema: TableDto[],
    destinationSchema: TableDto[],
  ): boolean {
    let databasesAreSame!: boolean;

    if (JSON.stringify(originSchema) === JSON.stringify(destinationSchema)) {
      databasesAreSame = true;
      return databasesAreSame;
    } else {
      databasesAreSame = false;
    }

    return databasesAreSame;
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

  private async getCardExistsInDestination(
    instance: InstanceEntity,
    card: CardDto,
  ): Promise<boolean | number> {
    const destinationCards = await this.cardRepository.findAll(instance);
    //TODO : Check that template tags are the same (QUestion parameters)
    for (const destinationCard of destinationCards) {
      if (
        destinationCard.dataset_query.type === 'native' &&
        card.dataset_query.type === 'native'
      ) {
        if (
          destinationCard.dataset_query.native.query ===
          card.dataset_query.native.query
        ) {
          return destinationCard.id;
        }
      }
    }
    return false;
  }

  private async getUsersExistInDestination(
    users: MetabaseCoreUserDependencyModel[],
    destinationInstance: InstanceEntity,
  ): Promise<MetabaseCoreUserDependencyModel[]> {
    for (const user of users) {
      if (user?.origin?.id) {
        const destinationUser = await this.getUser(
          destinationInstance,
          user.origin.id,
        );

        user.existsInDestination =
          destinationUser?.id === user.origin.id &&
          destinationUser?.email == user.origin.email;

        if (user.existsInDestination) {
          user.destination = destinationUser;
        } else {
          user.destination = {
            id: null,
            email: null,
          };
        }
      }
    }

    return users;
  }

  public async saveDashboard(
    originInstance: InstanceEntity,
    destinationInstance: InstanceEntity,
    dashboard: CreateDashboardDto,
  ): Promise<any> {
    this.consoleLogger.log(
      `Step ${this.step} : Initializing dashboard creation`,
    );

    const dashboardIsPublished = dashboard.dashboard.enable_embedding;
    const embeddingParams = dashboard.dashboard.embedding_params;

    dashboard = await this.saveCollections(destinationInstance, dashboard);

    dashboard = await this.saveCards(
      originInstance,
      destinationInstance,
      dashboard,
    );

    if (dashboard.dashboard.createOrUpdate === 'update') {
      dashboard = await this.updateExistingDashboard(
        destinationInstance,
        dashboard,
      );
    } else {
      dashboard = await this.createDashboard(destinationInstance, dashboard);
    }

    const dashboardUrl = `${destinationInstance.url}/dashboard/${dashboard.dashboard.id}`;

    dashboard.dashboard = await this.addCardsOnDashboard(
      destinationInstance,
      dashboard,
    );

    const cardsUpdated = await this.updateCardsOnDashboard(
      destinationInstance,
      dashboard,
    );

    this.consoleLogger.log(
      `Step ${this.step} : Updating cards on dashboard (size, params, ...)`,
    );

    if (dashboardIsPublished) {
      this.consoleLogger.log('Dashboard is published');
      dashboard.dashboard.embedding_params = embeddingParams;
      dashboard.dashboard = await this.dashboardService.enableDashboardEmbed(
        destinationInstance,
        dashboard.dashboard,
      );
    } else {
      this.consoleLogger.log('Dashboard is NOT published');
    }

    return {
      status: 'ok',
      url: dashboardUrl,
      dashboard: dashboard.dashboard,
      cardsUpdate: cardsUpdated,
    };
  }

  private async saveCollections(
    instance: InstanceEntity,
    dashboard: CreateDashboardDto,
  ): Promise<CreateDashboardDto> {
    this.step++;

    dashboard.collections = this.sortArrayByObjectId(dashboard.collections);
    this.consoleLogger.log(`Step ${this.step} : Sorting collections`);

    for (let i = 0; i < dashboard.collections.length; i++) {
      if (dashboard.collections[i].toCreate) {
        const collectionMapping: MetabaseEntityMapping = {
          originalId: dashboard.collections[i].id,
          newId: null,
        };

        this.consoleLogger.log(
          `Step ${this.step} : Saving collection #${dashboard.collections[i].id}`,
        );

        dashboard.collections[i] = await this.collectionRepository.save(
          instance,
          dashboard.collections[i],
        );

        collectionMapping.newId = dashboard.collections[i].id;

        dashboard.collections = this.updateCollectionParent(
          dashboard.collections,
          collectionMapping,
        );

        dashboard = this.updateCollectionInEntities(
          dashboard,
          collectionMapping,
        );
      } else {
        const collectionMapping: MetabaseEntityMapping = {
          originalId: dashboard.collections[i].id,
          newId: dashboard.collections[i].id,
        };

        dashboard.collections = this.updateCollectionParent(
          dashboard.collections,
          collectionMapping,
        );
        this.consoleLogger.log(
          `Collection ${dashboard.collections[i].id} already exists / has been mapped`,
        );
      }
    }
    return dashboard;
  }

  private sortArrayByObjectId(input: Array<any>): any {
    return input.sort((a, b) => a.id - b.id);
  }

  private updateCollectionInEntities(
    dashboard: CreateDashboardDto,
    collectionMapping: MetabaseEntityMapping,
  ): CreateDashboardDto {
    this.step++;
    if (dashboard.dashboard.collection_id === collectionMapping.originalId) {
      this.consoleLogger.log(
        `Step ${this.step} : Updating dashboard collectionId. Old collection: ${dashboard.dashboard.collection_id}. New collectionID : ${collectionMapping.newId}`,
      );
      dashboard.dashboard.collection_id = collectionMapping.newId;
    }

    dashboard.dashboard.ordered_cards.forEach((dashCard) => {
      if (dashCard.card.collection_id === collectionMapping.originalId) {
        this.consoleLogger.log(
          `Step ${this.step} : Updating card #${dashCard.card.id} collectionId. Old collection: ${dashCard.card.collection_id}. New collectionID : ${collectionMapping.newId}`,
        );

        dashCard.card.collection_id = collectionMapping.newId;
      }
    });

    return dashboard;
  }

  private updateDashcardsProperties(
    dashboard: CreateDashboardDto,
    cardsMapping: MetabaseEntityMapping,
  ): CreateDashboardDto {
    this.step++;
    this.consoleLogger.log(`Step ${this.step} : Updating dashcard properties.`);

    dashboard.dashboard.ordered_cards.forEach((dashCard) => {
      if (dashCard.card_id === cardsMapping.originalId) {
        this.consoleLogger.log(
          `Step ${this.step} : Updating dashcard ${dashCard.id}properties.`,
        );
        dashCard.card_id = cardsMapping.newId;
        dashCard.card.id = cardsMapping.newId;
        dashCard.parameter_mappings.forEach((param) => {
          param.card_id = cardsMapping.newId;
        });
      }
    });
    return dashboard;
  }

  private async saveCards(
    originInstance: InstanceEntity,
    destinationInstance: InstanceEntity,
    dashboard: CreateDashboardDto,
  ): Promise<CreateDashboardDto> {
    this.step++;
    this.consoleLogger.log(`Step ${this.step} : Sorting dashCards`);
    dashboard.dashboard.ordered_cards = this.sortArrayByObjectId(
      dashboard.dashboard.ordered_cards,
    );

    for (let i = 0; i < dashboard.dashboard.ordered_cards.length; i++) {
      const cardsMapping: MetabaseEntityMapping = {
        originalId: dashboard.dashboard.ordered_cards[i].card.id,
        newId: null,
      };

      if (dashboard.dashboard.ordered_cards[i].card_id) {
        dashboard.dashboard.ordered_cards[i].card.dataset_query =
          await this.updateDatasetQuery(
            originInstance,
            destinationInstance,
            dashboard.dashboard.ordered_cards[i].card.dataset_query,
            dashboard.dashboard.ordered_cards[i].card.id,
          );

        this.consoleLogger.log(
          `Step ${this.step} : Saving card ${dashboard.dashboard.ordered_cards[i].card.id}.`,
        );

        const cardExistsInDestination: boolean | number =
          await this.getCardExistsInDestination(
            destinationInstance,
            dashboard.dashboard.ordered_cards[i].card,
          );

        if (!cardExistsInDestination) {
          dashboard.dashboard.ordered_cards[i].card.description =
            this.processCardDescription(
              dashboard.dashboard.ordered_cards[i].card.description,
            );

          dashboard.dashboard.ordered_cards[i].card =
            await this.cardRepository.save(
              destinationInstance,
              dashboard.dashboard.ordered_cards[i].card,
            );

          cardsMapping.newId = dashboard.dashboard.ordered_cards[i].card.id;
        }

        if (typeof cardExistsInDestination === 'number') {
          cardsMapping.newId = cardExistsInDestination;
        }
        dashboard = this.updateDashcardsProperties(dashboard, cardsMapping);
      } else {
        //card is a virtual card : do nothing.
      }
    }

    return dashboard;
  }

  private updateCollectionParent(
    collections: MetabaseCollectionDto[],
    collectionMapping: MetabaseEntityMapping,
  ): MetabaseCollectionDto[] {
    this.step++;
    collections.forEach((collection) => {
      if (collection.parent_id === collectionMapping.originalId) {
        this.consoleLogger.log(
          `Step ${this.step} : Updating collection #${collection.id} parentId. Old parent: ${collection.parent_id}. New parent : ${collectionMapping.newId}`,
        );
        collection.parent_id = collectionMapping.newId;
      }
    });

    return collections;
  }

  private async updateDatasetQuery(
    originInstance: InstanceEntity,
    destinationInstance: InstanceEntity,
    dataSetQuery: DataSetQuery,
    cardId: number,
  ): Promise<DataSetQuery> {
    this.step++;
    this.consoleLogger.log(
      `Step ${this.step} : Updating datasetQuery for card ${cardId}.`,
    );
    if (dataSetQuery?.type === 'native') {
      const templateTagsKeys = Object.keys(
        dataSetQuery.native['template-tags'],
      );

      for (const templateTagKey of templateTagsKeys) {
        this.consoleLogger.log(
          `Step ${this.step} : Updating templateTags for card ${cardId}.`,
        );
        if (
          dataSetQuery.native['template-tags'][templateTagKey]?.type ===
          'dimension'
        ) {
          if (
            dataSetQuery.native['template-tags'][templateTagKey]
              ?.dimension[0] === 'field'
          ) {
            dataSetQuery.native['template-tags'][templateTagKey].dimension[1] =
              await this.findOriginFieldIdInDestination(
                originInstance,
                destinationInstance,
                dataSetQuery.native['template-tags'][templateTagKey]
                  ?.dimension[1],
              );
            this.consoleLogger.log(
              `Updating field ID ${dataSetQuery.native['template-tags'][templateTagKey].dimension[1]}`,
            );
          }
        }
      }
    }

    if (dataSetQuery.type === 'query') {
      if (typeof dataSetQuery?.query?.aggregation != 'undefined') {
        if (dataSetQuery?.query?.aggregation?.length > 0) {
          for (const aggregation of dataSetQuery.query.aggregation) {
            switch (aggregation[0]) {
              case 'sum':
              case 'aggregation-options':
              case 'distinct':
                if (aggregation[1][0] === 'field') {
                  const originalFieldId = aggregation[1][1];

                  aggregation[1][1] = await this.findOriginFieldIdInDestination(
                    originInstance,
                    destinationInstance,
                    originalFieldId,
                  );
                }
                break;

              case 'count':
                break;

              default:
                this.consoleLogger.error(
                  `Dataset query aggregation type : ${aggregation[0]} for card ${cardId} is not supported`,
                );
                break;
            }
          }
        }
      }
      if (typeof dataSetQuery?.query?.breakout != 'undefined') {
        if (dataSetQuery?.query?.breakout?.length > 0) {
          for (const breakout of dataSetQuery.query.breakout) {
            if (breakout[0] === 'field') {
              const originalFieldId = breakout[1];
              breakout[1] = await this.findOriginFieldIdInDestination(
                originInstance,
                destinationInstance,
                originalFieldId,
              );
            }
          }
        }
      }

      if (typeof dataSetQuery?.query?.joins != 'undefined') {
        if (dataSetQuery?.query?.joins?.length > 0) {
          for (const join of dataSetQuery.query.joins) {
            if (join['condition'][0] === '=') {
              if (join['condition'][1][0] === 'field')
                join['condition'][1][1] =
                  await this.findOriginFieldIdInDestination(
                    originInstance,
                    destinationInstance,
                    join['condition'][1][1],
                  );
            }
            const joinSourceTable = await this.getOriginTableInDestination(
              originInstance,
              destinationInstance,
              join['source-table'],
            );
            join['source-table'] = joinSourceTable.id;
          }
        }
      }
      const destinationSourceTable = await this.getOriginTableInDestination(
        originInstance,
        destinationInstance,
        dataSetQuery.query['source-table'],
      );

      dataSetQuery.query['source-table'] = destinationSourceTable.id;
    }

    return dataSetQuery;
  }

  private async findOriginFieldIdInDestination(
    originInstance: InstanceEntity,
    destinationInstance: InstanceEntity,
    fieldId: number,
  ): Promise<number> {
    const originField = await this.fieldRepository.findOneById(
      originInstance,
      fieldId,
    );

    const destinationTables = await this.tableRepository.getAllTables(
      destinationInstance,
    );

    let destinationTable = destinationTables.find(
      (table) =>
        table.name === originField.table.name &&
        table.schema === originField.table.schema,
    );

    const destinationDatabase = await this.databaseRepository.findOneById(
      destinationInstance,
      destinationTable.db_id,
    );

    destinationTable = destinationDatabase.tables.find(
      (table) =>
        table.name === destinationTable.name &&
        table.schema === destinationTable.schema,
    );

    const destinationField = destinationTable.fields.find(
      (field) => field.name === originField.name,
    );

    if (destinationField?.id) {
      return destinationField.id;
    } else {
      throw new Error(
        `Could not find destination field ID for original field #${originField.id}`,
      );
    }
  }

  private async getOriginTableInDestination(
    originInstance: InstanceEntity,
    destinationInstance: InstanceEntity,
    tableId: number,
  ): Promise<TableDto> {
    const destinationTables = await this.tableRepository.getAllTables(
      destinationInstance,
    );

    const originTables = await this.tableRepository.getAllTables(
      originInstance,
    );

    const originTable = originTables.find((table) => table.id === tableId);

    return destinationTables.find(
      (table) =>
        originTable.name === table.name && originTable.schema === table.schema,
    );
  }

  private async updateExistingDashboard(
    instance: InstanceEntity,
    dashboard: CreateDashboardDto,
  ): Promise<CreateDashboardDto> {
    this.step++;
    this.consoleLogger.log(
      `Step : ${this.step} UPDATING dashboard ${dashboard.dashboard.id}`,
    );
    const destinationDashboards = await this.dashboardService.findAll(
      instance.id,
    );
    const dashboardToUpdate: CreateDashboardDto = new CreateDashboardDto();

    dashboardToUpdate.dashboard = destinationDashboards.find(
      (destinationDashboard) =>
        destinationDashboard.name === dashboard.dashboard.name,
    );

    if (typeof dashboardToUpdate.dashboard != 'undefined') {
      dashboard.dashboard.id = dashboardToUpdate.dashboard.id;
      dashboardToUpdate.dashboard = await this.dashboardService.findOneById(
        instance,
        dashboardToUpdate.dashboard.id,
      );
      this.consoleLogger.log(JSON.stringify(dashboardToUpdate.dashboard));

      for (const dashCard of dashboardToUpdate.dashboard.ordered_cards) {
        await this.deleteCardOnDashboard(
          instance,
          dashboardToUpdate.dashboard.id,
          dashCard.id,
        );

        dashCard.isRemoved = true;
      }

      await this.dashcardRepository.updateCardsOnDashbaord(
        instance,
        dashboardToUpdate.dashboard.ordered_cards,
        dashboardToUpdate.dashboard.id,
      );
    } else {
      throw new Error('Could not find dashboard in destination');
    }

    return dashboard;
  }

  private async createDashboard(
    destinationInstance: InstanceEntity,
    dashboard: CreateDashboardDto,
  ): Promise<CreateDashboardDto> {
    this.step++;
    const dashCards = dashboard.dashboard.ordered_cards;
    this.consoleLogger.log(`Step ${this.step} : Creating new dashboard.`);
    dashboard.dashboard = await this.dashboardRepository.save(
      destinationInstance,
      dashboard.dashboard,
    );

    this.consoleLogger.log(
      `Step ${this.step} : Updating dashboardId in dashCards.`,
    );
    dashCards.forEach((dashCard) => {
      dashCard.dashboard_id = dashboard.dashboard.id;
    });

    dashboard.dashboard.ordered_cards = dashCards;

    return dashboard;
  }

  private async addCardsOnDashboard(
    instance: InstanceEntity,
    dashboard: CreateDashboardDto,
  ): Promise<DashboardDto> {
    this.step++;
    const cards = [];

    for (const dashCard of dashboard.dashboard.ordered_cards) {
      //
      const size_x =
        typeof dashCard.size_x != 'undefined'
          ? dashCard.size_x
          : dashCard.sizeX;
      const size_y =
        typeof dashCard.size_y != 'undefined'
          ? dashCard.size_y
          : dashCard.sizeY;

      const card: DashcardDto = {
        id: dashCard.id,
        size_x: size_x,
        size_y: size_y,
        sizeX: size_x,
        sizeY: size_y,
        row: dashCard.row,
        col: dashCard.col,
        parameter_mappings: dashCard.parameter_mappings,
        visualization_settings: dashCard.visualization_settings,
        series: dashCard.series,
      };
      this.consoleLogger.log(
        `Step ${this.step} : Adding card ${dashCard.card_id} on dashboard ${dashboard.dashboard.id}.`,
      );

      const cardOnDashboard = await this.dashcardRepository.addCardsOnDashboard(
        instance,
        dashboard.dashboard.id,
        dashCard.card_id,
        card,
      );
      this.consoleLogger.log(
        `Step ${this.step} : Updating card properties. Old ID : ${card.id}, new ID : ${cardOnDashboard.id}`,
      );

      card.id = cardOnDashboard.id;
      card.dashboard_id = cardOnDashboard.dashboard_id;

      cards.push(card);
    }

    dashboard.dashboard.ordered_cards = cards;

    return dashboard.dashboard;
  }

  private async updateCardsOnDashboard(
    instance: InstanceEntity,
    dashboard: CreateDashboardDto,
  ) {
    this.step++;
    this.consoleLogger.log(
      `Step ${this.step} : Updating cards on dashboard (size, params, ...)`,
    );
    return await this.dashcardRepository.updateCardsOnDashbaord(
      instance,
      dashboard.dashboard.ordered_cards,
      dashboard.dashboard.id,
    );
  }

  async deleteCardOnDashboard(
    instance: InstanceEntity,
    dashboardId: number,
    dashCardId: number,
  ): Promise<void> {
    await this.dashcardRepository.deleteCardOnDashboard(
      instance,
      dashboardId,
      dashCardId,
    );
  }
  private processCardDescription(description: string | null): string | null {
    if (description) {
      if (description.length > 0) {
        return description;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  private getCardsCollections(
    dashcards: DashcardDto[],
    originCollections: MetabaseCollectionDto[],
  ): MetabaseCollectionDependencyModel[] {
    const collections: MetabaseCollectionDependencyModel[] = [];

    for (let i = 0; i < dashcards.length; i++) {
      const cardCollection: MetabaseCollectionDependencyModel = {
        origin: null,
        existsInDestination: null,
        destination: null,
      };

      if (dashcards[i].card?.collection_id) {
        cardCollection.origin = originCollections.find(
          (collection) => collection.id === dashcards[i].card.collection_id,
        );

        if (!this.isObjectInArray(cardCollection, collections)) {
          collections.push(cardCollection);
        }
      }
    }

    return collections;
  }
}
