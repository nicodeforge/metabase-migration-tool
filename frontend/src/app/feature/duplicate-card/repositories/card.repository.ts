import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiCardDto } from '../../duplicate-dashboard/api-dto/api-card.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CardRepository {
  constructor(private readonly http: HttpClient) {}

  public async getCards(instanceId: string): Promise<ApiCardDto[]> {
    return await lastValueFrom(
      this.http.get<ApiCardDto[]>(
        `http://localhost:3100/metabase/${instanceId}/cards`
      )
    );
  }
}
