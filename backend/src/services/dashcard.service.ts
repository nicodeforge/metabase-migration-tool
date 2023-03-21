import { Injectable } from '@nestjs/common';
import { DashcardRepository } from '../repositories/metabase/dashcard.repository';
import { InstanceEntity } from '../instance/instance.entity';
import { DashcardDto } from '../dto/metabase/dashcard.dto';
import { DashboardDto } from '../dto/metabase/dashboard.dto';
import { MetabaseEntityMapping } from '../models/metabase-entity-mapping';

@Injectable()
export class DashcardService {
  constructor(private readonly dashcardRepository: DashcardRepository) {}

  public async deleteCardOnDashboard(
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

  public async updateCardsOnDashbaord(
    instance: InstanceEntity,
    dashcards: DashcardDto[],
    dashboardId: number,
  ) {
    return await this.dashcardRepository.updateCardsOnDashbaord(
      instance,
      dashcards,
      dashboardId,
    );
  }

  public updateDashcardsProperties(
    dashboard: DashboardDto,
    cardsMapping: MetabaseEntityMapping,
  ): DashboardDto {
    dashboard.ordered_cards.forEach((dashCard) => {
      if (dashCard.card_id === cardsMapping.originalId) {
        dashCard.card_id = cardsMapping.newId;
        dashCard.card.id = cardsMapping.newId;
        dashCard.parameter_mappings.forEach((param) => {
          param.card_id = cardsMapping.newId;
        });
      }
    });
    return dashboard;
  }

  public async addCardsOnDashboard(
    instance: InstanceEntity,
    dashboardId,
    cardId: number,
    dashcard: DashcardDto,
  ): Promise<DashcardDto> {
    return await this.dashcardRepository.addCardsOnDashboard(
      instance,
      dashboardId,
      cardId,
      dashcard,
    );
  }
}
