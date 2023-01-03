import { InstanceTypeEnum } from '../database/instance-type.enum';
import { MetabaseRepository } from '../repositories/metabase.repository';
import { ReportDashboardCardDto } from '../repositories/report-dashboardcard.dto';
import { Injectable } from '@nestjs/common';
import { ReportCardDto } from '../repositories/report-card.dto';
import { MetabaseCoreUserDto } from '../repositories/metabase-core-user.dto';
import { MetabaseDatabaseDto } from '../repositories/metabase-database.dto';
import { DashboardDependencyDto } from '../repositories/dashboard-dependency.dto';
import { MetabaseCollectionDto } from '../repositories/metabase-collection.dto';
import { MetabaseCollectionDependendyModel } from '../repositories/metabase-collection-dependendy.model';
import { MetabaseDatabaseDependencyModel } from '../repositories/metabase-database-dependency.model';
import { MetabaseTableDependencyModel } from '../repositories/metabase-table-dependency.model';
import { MetabaseCoreUserDependencyModel } from '../repositories/metabase-core-user-dependency.model';

@Injectable()
export class MetabaseService {
  constructor(private readonly mbRepo: MetabaseRepository) {}

  public async duplicateDashboardAcrossInstances(
    originInstance: InstanceTypeEnum,
    destinationInstance: InstanceTypeEnum,
    dashboardId: number,
  ): Promise<any> {
    const entitiesToDuplicate = await this.getEntitiesForDashboard(
      originInstance,
      dashboardId,
    );

    let originDashboardDependencies = await this.getDependencyForDashboard(
      originInstance,
      dashboardId,
    );

    originDashboardDependencies = await this.getDependenciesExistInDestination(
      originDashboardDependencies,
      destinationInstance,
    );

    return {
      entities_to_duplicate: entitiesToDuplicate,
      dependencies: originDashboardDependencies,
    };
  }

  public async getDependencyForDashboard(
    instance: InstanceTypeEnum,
    dashboardId: number,
  ): Promise<DashboardDependencyDto> {
    const dashboardEntities = await this.getEntitiesForDashboard(
      instance,
      dashboardId,
    );

    return this.getDashboardUniqueDependencies(dashboardEntities);
  }

  private async getEntitiesForDashboard(
    instance: InstanceTypeEnum,
    dashboardId: number,
  ): Promise<ReportDashboardCardDto[]> {
    let reportDashboardCards = await this.getReportDashboardCards(
      instance,
      dashboardId,
    );
    reportDashboardCards = await Promise.all(
      reportDashboardCards.map(
        async (dashboardCard: ReportDashboardCardDto) => {
          dashboardCard.card = await this.getCardForDashboardCard(
            instance,
            dashboardCard.card_id,
          );

          dashboardCard.dashboard = await this.getMetabaseDashboard(
            instance,
            dashboardCard.dashboard_id,
          );

          return dashboardCard;
        },
      ),
    );

    return reportDashboardCards;
  }

  private getDashboardUniqueDependencies(
    reportDashboardCards: ReportDashboardCardDto[],
  ): DashboardDependencyDto {
    const dashboardDeps: DashboardDependencyDto = {
      collections: [],
      databases: [],
      tables: [],
      users: [],
    };

    reportDashboardCards.map((dashboardCard: ReportDashboardCardDto) => {
      dashboardDeps.collections.push({
        collection: {
          id: dashboardCard.card?.collection?.id,
          name: dashboardCard.card?.collection?.name,
        },
      });

      dashboardDeps.databases.push({
        database: {
          id: dashboardCard.card?.database?.id,
          name: dashboardCard.card?.database?.name,
        },
      });

      dashboardDeps.tables.push({
        table: {
          id: dashboardCard.card?.table?.id,
          name: dashboardCard.card?.table?.name,
        },
      });

      dashboardDeps.users.push({
        user: {
          id: dashboardCard.card?.creator?.id,
          email: dashboardCard.card?.creator?.email,
        },
      });
    });

    return {
      collections: [...new Set(dashboardDeps?.collections)].filter((n) => n),
      databases: [...new Set(dashboardDeps?.databases)].filter((n) => n),
      tables: [...new Set(dashboardDeps?.tables)].filter((n) => n),
      users: [...new Set(dashboardDeps?.users)].filter((n) => n),
    };
  }

  private async getReportDashboardCards(
    instance: InstanceTypeEnum,
    dashboardId: number,
  ): Promise<ReportDashboardCardDto[]> {
    return await this.mbRepo.getReportDashboardCards(instance, dashboardId);
  }

  private async getCardForDashboardCard(
    instance: InstanceTypeEnum,
    cardId: number,
  ): Promise<ReportCardDto> {
    const card = await this.mbRepo.getReportCard(instance, cardId);

    return await this.extendCardProperties(instance, card);
  }

  private async extendCardProperties(
    instance: InstanceTypeEnum,
    card: ReportCardDto,
  ): Promise<ReportCardDto> {
    if (card?.creator_id) {
      card.creator = await this.getCoreUser(instance, card.creator_id);
    }

    if (card?.database_id) {
      card.database = await this.getMetabaseDatabase(
        instance,
        card.database_id,
      );
    }

    if (card?.table_id) {
      card.table = await this.getMetabaseTable(instance, card.table_id);
    }

    if (card?.collection_id) {
      card.collection = await this.getMetabaseCollection(
        instance,
        card.collection_id,
      );
    }
    return card;
  }

  private async getCoreUser(
    instance: InstanceTypeEnum,
    userId: number,
  ): Promise<MetabaseCoreUserDto> {
    return await this.mbRepo.getCoreUser(instance, userId);
  }

  private async getMetabaseDatabase(
    instance: InstanceTypeEnum,
    databaseId: number,
  ): Promise<MetabaseDatabaseDto> {
    return await this.mbRepo.getMetabaseDatabase(instance, databaseId);
  }

  private async getMetabaseTable(instance: InstanceTypeEnum, tableId: number) {
    return await this.mbRepo.getMetabaseTable(instance, tableId);
  }

  private async getMetabaseCollection(
    instance: InstanceTypeEnum,
    collectionId: number,
  ): Promise<MetabaseCollectionDto> {
    return await this.mbRepo.getMetabaseCollection(instance, collectionId);
  }

  private async getMetabaseDashboard(
    instance: InstanceTypeEnum,
    dashboardId: number,
  ) {
    return await this.mbRepo.getMetabaseDashboard(instance, dashboardId);
  }

  private async getDatabasesExistInDestination(
    databases: {
      database: MetabaseDatabaseDto;
      existsInDestination?: boolean;
    }[],
    destinationInstance: InstanceTypeEnum,
  ): Promise<MetabaseDatabaseDependencyModel[]> {
    for (const originDatabase of databases) {
      if (originDatabase?.database?.id) {
        const destinationDatabase = await this.getMetabaseDatabase(
          destinationInstance,
          originDatabase.database.id,
        );

        originDatabase.existsInDestination =
          destinationDatabase?.id === originDatabase.database.id &&
          destinationDatabase?.name == originDatabase.database.name;
      }
    }

    return databases;
  }

  private async getCollectionsExistInDestination(
    collections: MetabaseCollectionDependendyModel[],
    destinationInstance: InstanceTypeEnum,
  ): Promise<MetabaseCollectionDependendyModel[]> {
    for (const originCollection of collections) {
      if (originCollection?.collection?.id) {
        const destinationDatabase = await this.getMetabaseCollection(
          destinationInstance,
          originCollection.collection.id,
        );

        originCollection.existsInDestination =
          destinationDatabase?.id === originCollection.collection.id &&
          destinationDatabase?.name == originCollection.collection.name;
      }
    }

    return collections;
  }

  private async getTablesExistInDestination(
    tables: MetabaseTableDependencyModel[],
    destinationInstance: InstanceTypeEnum,
  ): Promise<MetabaseTableDependencyModel[]> {
    for (const originTable of tables) {
      if (originTable?.table?.id) {
        const destinationTable = await this.getMetabaseTable(
          destinationInstance,
          originTable.table.id,
        );

        originTable.existsInDestination =
          destinationTable?.id === originTable.table.id &&
          destinationTable?.name == originTable.table.name;
      }
    }

    return tables;
  }

  private async getUsersExistInDestination(
    users: MetabaseCoreUserDependencyModel[],
    destinationInstance: InstanceTypeEnum,
  ): Promise<MetabaseCoreUserDependencyModel[]> {
    for (const originUser of users) {
      if (originUser?.user?.id) {
        const destinationUser = await this.getCoreUser(
          destinationInstance,
          originUser.user.id,
        );

        originUser.existsInDestination =
          destinationUser?.id === originUser.user.id &&
          destinationUser?.email == originUser.user.email;
      }
    }

    return users;
  }

  private async getDependenciesExistInDestination(
    originDashboardDependencies: DashboardDependencyDto,
    destinationInstance: InstanceTypeEnum,
  ): Promise<DashboardDependencyDto> {
    originDashboardDependencies.collections =
      await this.getCollectionsExistInDestination(
        originDashboardDependencies.collections,
        destinationInstance,
      );

    originDashboardDependencies.databases =
      await this.getDatabasesExistInDestination(
        originDashboardDependencies.databases,
        destinationInstance,
      );

    originDashboardDependencies.tables = await this.getTablesExistInDestination(
      originDashboardDependencies.tables,
      destinationInstance,
    );

    originDashboardDependencies.users = await this.getUsersExistInDestination(
      originDashboardDependencies.users,
      destinationInstance,
    );

    return originDashboardDependencies;
  }
}
