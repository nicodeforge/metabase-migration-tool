import { Injectable } from '@nestjs/common';
import { MetabaseAuthService } from '../../services/metabase-auth.service';
import { ApiQueryService } from '../../services/api-query.service';
import { DashcardDto } from '../../dto/metabase/dashcard.dto';
import { DashboardDto } from '../../dto/metabase/dashboard.dto';
import { InstanceEntity } from '../../instance/instance.entity';

@Injectable()
export class DashcardRepository {
  constructor(
    private readonly auth: MetabaseAuthService,
    private readonly apiQueryService: ApiQueryService,
  ) {}

  public async addCardsOnDashboard(
    instance: InstanceEntity,
    dashboardId: number,
    cardId: number,
    dashCard: DashcardDto,
  ): Promise<DashcardDto> {
    const metabase = await this.auth.getMetabaseInstanceV2(instance);
    const endpoint = `${metabase.url}/api/dashboard/${dashboardId}/cards`;
    console.log(`On addCardsOnDashboard`);
    console.log(
      `Card #${dashCard.card_id} size_x : ${dashCard.size_x} // size_y: ${dashCard.size_y}`,
    );
    const payload = {
      cardId: cardId,
      parameter_mappings: dashCard.parameter_mappings,
      'dashboard-card': dashCard,
    };
    return await this.apiQueryService.processPostReqest(
      endpoint,
      payload,
      metabase.token,
    );
  }

  async updateCardsOnDashbaord(
    instance: InstanceEntity,
    dashcards: DashcardDto[],
    dashboardId: number,
  ): Promise<DashboardDto> {
    const metabase = await this.auth.getMetabaseInstanceV2(instance);
    const endpoint = `${metabase.url}/api/dashboard/${dashboardId}/cards`;
    console.log(`On updateCardsOnDashboard`);
    dashcards.forEach((card) => {
      console.log(
        `Card #${card.card_id} size_x : ${card.size_x} // size_y: ${card.size_y}`,
      );
    });
    const payload = {
      cards: dashcards,
    };
    return await this.apiQueryService.processPutRequest(
      endpoint,
      payload,
      metabase.token,
    );
  }

  public async deleteCardOnDashboard(
    instance: InstanceEntity,
    dashboardId: number,
    dashCardId: number,
  ): Promise<void> {
    const metabase = await this.auth.getMetabaseInstanceV2(instance);
    const endpoint = `${metabase.url}/api/dashboard/${dashboardId}/cards?dashcardId=${dashCardId}`;

    return await this.apiQueryService.processDeleteRequest(
      endpoint,
      metabase.token,
    );
  }
}
