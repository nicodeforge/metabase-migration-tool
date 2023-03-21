import { Injectable } from '@angular/core';
import { ApiCardDto } from '../../duplicate-dashboard/api-dto/api-card.dto';
import { CardRepository } from '../repositories/card.repository';
import { MetabaseInstanceDto } from '../../metabase-instance/dto/metabase-instance.dto';

@Injectable()
export class CardService {
  constructor(private readonly cardRepository: CardRepository) {}

  public async getCards(instance: MetabaseInstanceDto): Promise<ApiCardDto[]> {
    return this.cardRepository.getCards(instance.id);
  }
}
