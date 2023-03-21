import { Injectable } from '@nestjs/common';
import { InstanceEntity } from '../instance/instance.entity';
import { MetabaseCoreUserDependencyModel } from '../models/metabase-core-user-dependency.model';
import { MetabaseCoreUserDto } from '../dto/metabase/metabase-core-user.dto';
import { ModelWithDependenciesDto } from '../dto/app/model-with-dependencies.dto';
import { MetabaseUserRepository } from '../repositories/metabase/metabase-user.repository';
import { UtilsService } from './utils.service';
import { MetabaseApiService } from './metabase-api.service';
import { MetabaseModelTypeEnum } from '../controllers/metabase-model-type.enum';

@Injectable()
export class UserService {
  constructor(
    private userRepository: MetabaseUserRepository,
    private utils: UtilsService,
    private metabaseApiService: MetabaseApiService,
  ) {}
  public async getUserDependencies(
    originInstance: InstanceEntity,
    modelWithDependencies: ModelWithDependenciesDto,
  ): Promise<MetabaseCoreUserDependencyModel[]> {
    const usersDependencies: MetabaseCoreUserDependencyModel[] = [];

    const originUsersIncludingInactive: MetabaseCoreUserDto[] =
      await this.userRepository.findAll(originInstance);

    if (modelWithDependencies.type === MetabaseModelTypeEnum.DASHBOARD) {
      const dashboardUser: MetabaseCoreUserDependencyModel = {
        origin: null,
        existsInDestination: null,
        destination: null,
      };

      dashboardUser.origin = originUsersIncludingInactive.find(
        (user) => user.id === modelWithDependencies.origin.creator_id,
      );

      const dashboardPublisher: MetabaseCoreUserDependencyModel = {
        origin: null,
        existsInDestination: null,
        destination: null,
      };

      if (modelWithDependencies.origin.made_public_by_id) {
        originUsersIncludingInactive.find(
          (user) => user.id === modelWithDependencies.origin.made_public_by_id,
        );
      }

      if (!this.utils.isObjectInArray(dashboardUser, usersDependencies)) {
        usersDependencies.push(dashboardUser);
      }

      if (!this.utils.isObjectInArray(dashboardPublisher, usersDependencies)) {
        usersDependencies.push(dashboardUser);
      }

      const cardCreators: MetabaseCoreUserDependencyModel[] = [];
      const cardPublishers: MetabaseCoreUserDependencyModel[] = [];
      for (
        let i = 0;
        i < modelWithDependencies.origin['ordered_cards'].length;
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

        if (modelWithDependencies.origin['ordered_cards'][i].card.creator_id) {
          cardCreator.origin = originUsersIncludingInactive.find((user) => {
            if (
              modelWithDependencies.type === MetabaseModelTypeEnum.DASHBOARD
            ) {
              return (
                user.id ===
                modelWithDependencies.origin['ordered_cards'][i].card.creator_id
              );
            }
          });
        }

        if (
          modelWithDependencies.origin['ordered_cards'][i].card
            ?.made_public_by_id
        ) {
          cardPublisher.origin = originUsersIncludingInactive.find((user) => {
            if (
              modelWithDependencies.type === MetabaseModelTypeEnum.DASHBOARD
            ) {
              return (
                user.id ===
                modelWithDependencies.origin['ordered_cards'][i].card
                  ?.made_public_by_id
              );
            }
          });
        }
        if (!this.utils.isObjectInArray(cardCreator, cardCreators)) {
          cardCreators.push(cardCreator);
        }

        if (!this.utils.isObjectInArray(cardPublisher, cardPublishers)) {
          cardPublishers.push(cardPublisher);
        }
      }
      cardCreators.forEach((cardCreator) => {
        if (!this.utils.isObjectInArray(cardCreator, usersDependencies)) {
          usersDependencies.push(cardCreator);
        }
      });

      cardPublishers.forEach((cardPublisher) => {
        if (!this.utils.isObjectInArray(cardPublisher, usersDependencies)) {
          usersDependencies.push(cardPublisher);
        }
      });
    }

    if (modelWithDependencies.type === MetabaseModelTypeEnum.CARD) {
      if (modelWithDependencies.origin.creator_id) {
        const cardCreator: MetabaseCoreUserDependencyModel = {
          origin: null,
          existsInDestination: null,
          destination: null,
        };
        cardCreator.origin = originUsersIncludingInactive.find(
          (user) => user.id === modelWithDependencies.origin.creator_id,
        );

        if (!this.utils.isObjectInArray(cardCreator, usersDependencies)) {
          usersDependencies.push(cardCreator);
        }
      }

      if (modelWithDependencies.origin?.made_public_by_id) {
        const cardPublisher: MetabaseCoreUserDependencyModel = {
          origin: null,
          existsInDestination: null,
          destination: null,
        };

        cardPublisher.origin = originUsersIncludingInactive.find(
          (user) => user.id === modelWithDependencies.origin?.made_public_by_id,
        );

        if (!this.utils.isObjectInArray(cardPublisher, usersDependencies)) {
          usersDependencies.push(cardPublisher);
        }
      }
    }

    return usersDependencies;
  }

  public async getUsersExistInDestination(
    users: MetabaseCoreUserDependencyModel[],
    destinationInstance: InstanceEntity,
  ) {
    for (const user of users) {
      if (user?.origin?.id) {
        const destinationUser = await this.metabaseApiService.getUser(
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
}
