import { Injectable } from '@nestjs/common';
import { InstanceEntity } from '../instance/instance.entity';
import { MetabaseDatabaseDependencyModel } from '../models/metabase-database-dependency.model';
import { ModelWithDependenciesDto } from '../dto/app/model-with-dependencies.dto';
import { DatabaseRepository } from '../repositories/metabase/database.repository';
import { UtilsService } from './utils.service';
import { TableDto } from '../dto/metabase/table.dto';
import { MetabaseApiService } from './metabase-api.service';
import { MetabaseModelTypeEnum } from '../controllers/metabase-model-type.enum';
import { DatabaseCheckSchemaRequestDto } from '../dto/app/database-check-schema-request.dto';
import { DatabaseSchemaEqualityInterface } from '../models/database-schema-equality.interface';
import { InstanceService } from '../instance/instance.service';

@Injectable()
export class DatabaseService {
  constructor(
    private readonly databaseRepository: DatabaseRepository,
    private readonly metabaseApiService: MetabaseApiService,
    private readonly instanceService: InstanceService,
    private utils: UtilsService,
  ) {}
  public async getDatabaseDependencies(
    instance: InstanceEntity,
    modelWithDependencies: ModelWithDependenciesDto,
  ): Promise<MetabaseDatabaseDependencyModel[]> {
    const databasesDependencies: MetabaseDatabaseDependencyModel[] = [];

    const cardDatabasesDependencies: MetabaseDatabaseDependencyModel[] = [];

    let cardDatabase!: MetabaseDatabaseDependencyModel;

    if (modelWithDependencies.type === MetabaseModelTypeEnum.DASHBOARD) {
      for (
        let i = 0;
        i < modelWithDependencies.origin['ordered_cards'].length;
        i++
      ) {
        if (modelWithDependencies.origin['ordered_cards'][i].card.database_id) {
          cardDatabase = await this.getMetabaseDatabaseDependencyModel(
            instance,
            modelWithDependencies.origin['ordered_cards'][i].card.database_id,
          );

          if (
            !this.utils.isObjectInArray(cardDatabase, cardDatabasesDependencies)
          ) {
            cardDatabasesDependencies.push(cardDatabase);
          }
        }
      }
    }

    if (modelWithDependencies.type === MetabaseModelTypeEnum.CARD) {
      cardDatabase = await this.getMetabaseDatabaseDependencyModel(
        instance,
        modelWithDependencies.origin['database_id'],
      );

      if (
        !this.utils.isObjectInArray(cardDatabase, cardDatabasesDependencies)
      ) {
        cardDatabasesDependencies.push(cardDatabase);
      }
    }

    databasesDependencies.push(...cardDatabasesDependencies);

    return databasesDependencies;
  }

  private async getMetabaseDatabaseDependencyModel(
    instance: InstanceEntity,
    databaseId: number,
  ): Promise<MetabaseDatabaseDependencyModel> {
    return {
      origin: await this.databaseRepository.findOneById(instance, databaseId),
    };
  }

  public async getDatabasesExistInDestination(
    databases: MetabaseDatabaseDependencyModel[],
    destinationInstance: InstanceEntity,
  ) {
    for (const database of databases) {
      if (database?.origin?.id) {
        const destinationDatabase =
          await this.metabaseApiService.getDatabaseInfo(
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

  public async getDatabasesShareSameSchema(
    databaseSchemaCheckRequest: DatabaseCheckSchemaRequestDto,
  ): Promise<DatabaseSchemaEqualityInterface> {
    const originInstance = await this.instanceService.findById(
      databaseSchemaCheckRequest.originInstanceId,
    );
    const destinationInstance = await this.instanceService.findById(
      databaseSchemaCheckRequest.destinationInstanceId,
    );

    const originalDb = await this.metabaseApiService.getDatabaseInfo(
      originInstance,
      databaseSchemaCheckRequest.originDatabaseId,
    );
    const destinationDb = await this.metabaseApiService.getDatabaseInfo(
      destinationInstance,
      databaseSchemaCheckRequest.destinationDatabaseId,
    );

    const originTablesNotFoundInDestination = [];

    for (const originalTable of originalDb.tables) {
      const destinationTable = destinationDb?.tables.find(
        (destinationTable) =>
          destinationTable.name === originalTable.name &&
          destinationTable.schema === originalTable.schema,
      );

      if (typeof destinationTable === 'undefined') {
        originTablesNotFoundInDestination.push(originalTable.name);
      }
    }

    return {
      status: originTablesNotFoundInDestination.length === 0,
      result: originTablesNotFoundInDestination,
    };
  }

  public async findOneById(instance: InstanceEntity, databaseId: number) {
    return await this.databaseRepository.findOneById(instance, databaseId);
  }
}
