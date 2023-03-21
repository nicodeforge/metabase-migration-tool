import { Injectable } from '@nestjs/common';
import { InstanceEntity } from '../instance/instance.entity';
import { CreateModelDto } from '../dto/app/save-model-request.dto';
import { CreateDashboardDto } from '../dto/metabase/create-dashboard.dto';
import { DashboardDto } from '../dto/metabase/dashboard.dto';
import { DashboardRepository } from '../repositories/metabase/dashboard.repository';
import { InstanceService } from '../instance/instance.service';
import { UtilsService } from './utils.service';
import { DashcardService } from './dashcard.service';
import { DashcardDto } from '../dto/metabase/dashcard.dto';
import { CardDto } from '../dto/metabase/card.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly instanceService: InstanceService,
    private readonly utilsService: UtilsService,
    private readonly dashcardService: DashcardService,
  ) {}

  public async findOneById(
    instance: InstanceEntity,
    dashboardId: number,
  ): Promise<DashboardDto> {
    return await this.dashboardRepository.findOneById(instance, dashboardId);
  }
  public async findAll(instanceId: string): Promise<DashboardDto[]> {
    const instance = await this.instanceService.findById(instanceId);
    return await this.dashboardRepository.findAll(instance);
  }

  public async isDashboardExiststingInInstance(
    instance: InstanceEntity,
    dashboard: DashboardDto,
  ): Promise<boolean> {
    const destinationDashboards: DashboardDto[] = await this.findAll(
      instance.id,
    );

    const dashboardWithSameName = destinationDashboards.find(
      (destinationDashboard) => destinationDashboard.name === dashboard.name,
    );

    return typeof dashboardWithSameName !== 'undefined';
  }
  public async updateExistingDashboard(
    instance: InstanceEntity,
    model: CreateModelDto,
  ): Promise<CreateModelDto> {
    if (!this.isDashboardModel(model.model)) {
      return;
    }
    const destinationDashboards = await this.findAll(instance.id);
    const dashboardToUpdate: CreateDashboardDto = new CreateDashboardDto();

    dashboardToUpdate.dashboard = destinationDashboards.find(
      (destinationDashboard) => destinationDashboard.name === model.model.name,
    );

    if (typeof dashboardToUpdate.dashboard != 'undefined') {
      model.model.id = dashboardToUpdate.dashboard.id;
      dashboardToUpdate.dashboard = await this.findOneById(
        instance,
        dashboardToUpdate.dashboard.id,
      );

      for (const dashCard of dashboardToUpdate.dashboard.ordered_cards) {
        await this.dashcardService.deleteCardOnDashboard(
          instance,
          dashboardToUpdate.dashboard.id,
          dashCard.id,
        );

        dashCard.isRemoved = true;
      }

      await this.dashcardService.updateCardsOnDashbaord(
        instance,
        dashboardToUpdate.dashboard.ordered_cards,
        dashboardToUpdate.dashboard.id,
      );
    } else {
      throw new Error('Could not find dashboard in destination');
    }

    return model;
  }

  public async updateDashcardsDashboardId(
    destinationInstance: InstanceEntity,
    model: CreateModelDto,
  ): Promise<DashcardDto[]> {
    if (!this.isDashboardModel(model.model)) return;

    /*const dashCards = model.model.ordered_cards;

    dashCards.forEach((dashCard) => {
      dashCard.dashboard_id = model.model.id;
    });

    model.model.ordered_cards = dashCards;*/

    return model.model.ordered_cards.map((dashCard) => {
      dashCard.dashboard_id = model.model.id;
      return dashCard;
    });
  }

  public async addCardsOnDashboard(
    instance: InstanceEntity,
    model: CreateModelDto,
  ): Promise<DashboardDto> {
    if (!this.isDashboardModel(model.model)) return;

    const cards = [];

    for (const dashCard of model.model.ordered_cards) {
      //
      const size_x =
        typeof dashCard.size_x != 'undefined'
          ? dashCard.size_x
          : dashCard.sizeX;
      const size_y =
        typeof dashCard.size_y != 'undefined'
          ? dashCard.size_y
          : dashCard.sizeY;

      const dashcard: DashcardDto = {
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

      const cardOnDashboard = await this.dashcardService.addCardsOnDashboard(
        instance,
        model.model.id,
        dashCard.card_id,
        dashcard,
      );

      dashcard.id = cardOnDashboard.id;
      dashcard.dashboard_id = cardOnDashboard.dashboard_id;

      cards.push(dashcard);
    }

    model.model.ordered_cards = cards;

    return model.model;
  }

  public async enableDashboardEmbed(
    instance: InstanceEntity,
    dashboard: DashboardDto,
  ): Promise<DashboardDto> {
    return await this.dashboardRepository.enableEmbedding(instance, dashboard);
  }

  public isDashboardModel(
    model: DashboardDto | CardDto,
  ): model is DashboardDto {
    return (model as DashboardDto).ordered_cards !== undefined;
  }

  public async saveDashboard(instance: InstanceEntity, model: CreateModelDto) {
    if (!this.isDashboardModel(model.model)) return;
    const dashboardIsPublished = model.model.enable_embedding;
    const embeddingParams = model.model.embedding_params;
    if (model.model.createOrUpdate === 'update') {
      model = await this.updateExistingDashboard(instance, model);
    } else {
      model.model.ordered_cards = await this.updateDashcardsDashboardId(
        instance,
        model,
      );
    }

    const dashboardUrl = `${instance.url}/dashboard/${model.model.id}`;

    model.model = await this.addCardsOnDashboard(instance, model);

    const cardsUpdated = await this.dashcardService.updateCardsOnDashbaord(
      instance,
      model.model.ordered_cards,
      model.model.id,
    );

    if (dashboardIsPublished) {
      model.model.embedding_params = embeddingParams;
      model.model = await this.enableDashboardEmbed(instance, model.model);
    }

    return {
      status: 'ok',
      url: dashboardUrl,
      dashboard: model.model,
      cardsUpdate: cardsUpdated,
    };
  }
}
