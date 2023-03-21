import { Injectable } from '@nestjs/common';
import { InstanceEntity } from '../instance/instance.entity';
import { ModelWithDependenciesDto } from '../dto/app/model-with-dependencies.dto';
import { ApiModelDependencyDto } from '../dto/app/api-model-dependency.dto';
import { CollectionService } from './collection.service';
import { DatabaseService } from './database.service';
import { UserService } from './user.service';

@Injectable()
export class DependencyService {
  constructor(
    private readonly collectionService: CollectionService,
    private readonly databaseService: DatabaseService,
    private readonly userService: UserService,
  ) {}
  public async processUniqueDependencies(
    originInstance: InstanceEntity,
    modelWithDependencies: ModelWithDependenciesDto,
  ): Promise<ApiModelDependencyDto> {
    const modelDependency: ApiModelDependencyDto = {
      collections: [],
      databases: [],
      users: [],
      tables: [],
      fields: [],
    };

    modelDependency.collections =
      await this.collectionService.getCollectionDependencies(
        originInstance,
        modelWithDependencies,
      );

    modelDependency.databases =
      await this.databaseService.getDatabaseDependencies(
        originInstance,
        modelWithDependencies,
      );

    modelDependency.users = await this.userService.getUserDependencies(
      originInstance,
      modelWithDependencies,
    );

    modelDependency.collections = [
      ...new Set(modelDependency?.collections),
    ].filter((n) => n);

    modelDependency.databases = [...new Set(modelDependency?.databases)].filter(
      (n) => n,
    );

    modelDependency.users = [...new Set(modelDependency?.users)].filter(
      (n) => n,
    );

    return modelDependency;
  }

  public async getDependenciesExistInDestination(
    destinationInstance: InstanceEntity,
    modelWithDependencies: ModelWithDependenciesDto,
  ): Promise<ApiModelDependencyDto> {
    modelWithDependencies.dependencies.collections =
      await this.collectionService.getCollectionsExistInDestination(
        modelWithDependencies.dependencies.collections,
        destinationInstance,
      );

    modelWithDependencies.dependencies.databases =
      await this.databaseService.getDatabasesExistInDestination(
        modelWithDependencies.dependencies.databases,
        destinationInstance,
      );

    modelWithDependencies.dependencies.users =
      await this.userService.getUsersExistInDestination(
        modelWithDependencies.dependencies.users,
        destinationInstance,
      );

    return modelWithDependencies.dependencies;
  }
}
