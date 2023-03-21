import { BadRequestException, Injectable } from '@nestjs/common';
import { InstanceService } from '../instance/instance.service';
import { ModelDependencyRequest } from '../dto/app/model-dependency-request';
import { ModelWithDependenciesDto } from '../dto/app/model-with-dependencies.dto';
import { MetabaseModelTypeEnum } from '../controllers/metabase-model-type.enum';
import { InstanceEntity } from '../instance/instance.entity';
import { UtilsService } from './utils.service';
import { CollectionService } from './collection.service';
import { DatabaseService } from './database.service';
import { UserService } from './user.service';
import { DashboardDto } from '../dto/metabase/dashboard.dto';
import {
  CreateModelDto,
  SaveModelRequestDto,
} from '../dto/app/save-model-request.dto';
import { MetabaseEntityMapping } from '../models/metabase-entity-mapping';
import { DashcardDto } from '../dto/metabase/dashcard.dto';
import { DashboardService } from './dashboard.service';
import { DashcardService } from './dashcard.service';
import { CardService } from './card.service';
import { FieldService } from './field.service';
import { TableService } from './table.service';
import { DependencyService } from './dependency.service';

@Injectable()
export class ModelService {
  constructor(
    private instanceService: InstanceService,
    private utilsService: UtilsService,
    private collectionService: CollectionService,
    private databaseService: DatabaseService,
    private userService: UserService,
    private dashboardService: DashboardService,
    private dashcardService: DashcardService,
    private cardService: CardService,
    private fieldService: FieldService,
    private tableService: TableService,
    private dependencyService: DependencyService,
  ) {}

  public async getModelWithDepencies(
    payload: ModelDependencyRequest,
  ): Promise<ModelWithDependenciesDto> {
    const modelWithDependencies: ModelWithDependenciesDto =
      new ModelWithDependenciesDto();

    const { originInstanceId, destinationInstanceId, modelType, modelId } =
      payload;

    const originInstance = await this.instanceService.findById(
      originInstanceId,
    );
    const destinationInstance = await this.instanceService.findById(
      destinationInstanceId,
    );

    modelWithDependencies.type = modelType;

    if (modelWithDependencies.type === MetabaseModelTypeEnum.CARD) {
      modelWithDependencies.origin = await this.cardService.findOneById(
        originInstance,
        modelId,
      );
    }

    if (modelWithDependencies.type === MetabaseModelTypeEnum.DASHBOARD) {
      modelWithDependencies.origin = await this.dashboardService.findOneById(
        originInstance,
        modelId,
      );
    }

    modelWithDependencies.dependencies =
      await this.dependencyService.processUniqueDependencies(
        originInstance,
        modelWithDependencies,
      );

    modelWithDependencies.dependencies =
      await this.dependencyService.getDependenciesExistInDestination(
        destinationInstance,
        modelWithDependencies,
      );

    modelWithDependencies.existsInDestination =
      await this.isModelExistingInDestination(
        destinationInstance,
        modelWithDependencies,
      );

    return modelWithDependencies;
  }

  private async isModelExistingInDestination(
    destinationInstance: InstanceEntity,
    modelWithDependencies: ModelWithDependenciesDto,
  ): Promise<boolean> {
    if (this.dashboardService.isDashboardModel(modelWithDependencies.origin)) {
      return await this.dashboardService.isDashboardExiststingInInstance(
        destinationInstance,
        modelWithDependencies.origin,
      );
    }

    if (this.cardService.isCardModel(modelWithDependencies.origin)) {
      return await this.cardService.isCardExistingInInstance(
        destinationInstance,
        modelWithDependencies.origin,
      );
    }

    throw new BadRequestException('Model is neither a Card nor a Dashboard');
  }

  public async saveModel(payload: SaveModelRequestDto) {
    // eslint-disable-next-line prefer-const
    let { originInstanceId, destinationInstanceId, model } = payload;

    const originInstance = await this.instanceService.findById(
      originInstanceId,
    );

    const destinationInstance = await this.instanceService.findById(
      destinationInstanceId,
    );

    model = await this.collectionService.saveCollections(
      destinationInstance,
      model,
    );

    if (this.dashboardService.isDashboardModel(model.model)) {
      model = await this.saveCards(originInstance, destinationInstance, model);
      return this.dashboardService.saveDashboard(destinationInstance, model);
    }

    if (this.cardService.isCardModel(model.model)) {
      model.model.dataset_query = await this.cardService.updateDatasetQuery(
        originInstance,
        destinationInstance,
        model.model.dataset_query,
      );

      const cardExistsInDestination: boolean | number =
        await this.cardService.isCardExistingInInstance(
          destinationInstance,
          model.model,
        );

      if (!cardExistsInDestination) {
        model.model.description = this.cardService.processCardDescription(
          model.model.description,
        );
      }

      const newCard = await this.cardService.save(
        destinationInstance,
        model.model,
      );
      if (newCard) {
        return {
          status: 'ok',
          url: `${destinationInstance.url}/card/${newCard.id}`,
          model: model.model,
        };
      }
    }
  }

  private async saveCards(
    originInstance: InstanceEntity,
    destinationInstance: InstanceEntity,
    model: CreateModelDto,
  ): Promise<CreateModelDto> {
    if (this.dashboardService.isDashboardModel(model.model)) {
      let dashboard = model.model as DashboardDto;
      dashboard.ordered_cards = <DashcardDto[]>(
        this.utilsService.sortArrayByObjectId(model.model.ordered_cards)
      );

      for (let i = 0; i < dashboard.ordered_cards.length; i++) {
        const cardsMapping: MetabaseEntityMapping = {
          originalId: dashboard.ordered_cards[i].card.id,
          newId: null,
        };

        if (dashboard.ordered_cards[i].card_id) {
          dashboard.ordered_cards[i].card.dataset_query =
            await this.cardService.updateDatasetQuery(
              originInstance,
              destinationInstance,
              dashboard.ordered_cards[i].card.dataset_query,
            );

          const cardExistsInDestination: boolean | number =
            await this.cardService.isCardExistingInInstance(
              destinationInstance,
              dashboard.ordered_cards[i].card,
            );

          if (!cardExistsInDestination) {
            dashboard.ordered_cards[i].card.description =
              this.cardService.processCardDescription(
                dashboard.ordered_cards[i].card.description,
              );

            dashboard.ordered_cards[i].card = await this.cardService.save(
              destinationInstance,
              dashboard.ordered_cards[i].card,
            );

            cardsMapping.newId = dashboard.ordered_cards[i].card.id;
          }

          if (typeof cardExistsInDestination === 'number') {
            cardsMapping.newId = cardExistsInDestination;
          }
          dashboard = this.dashcardService.updateDashcardsProperties(
            dashboard,
            cardsMapping,
          );

          model.model = dashboard;
        } else {
          //card is a virtual card : do nothing.
        }
      }
    }

    return model;
  }
}
