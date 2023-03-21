import { MetabaseModelTypeEnum } from '../../feature/duplicate-dashboard/dto/model-with-dependencies.dto';
import { ApiDashboardDto } from '../../feature/duplicate-dashboard/api-dto/api-dashboard.dto';
import { ApiCardDto } from '../../feature/duplicate-dashboard/api-dto/api-card.dto';
import { ApiCollectionDto } from '../../feature/duplicate-dashboard/api-dto/api-collection.dto';

export class CreateModelDto {
  constructor(
    public type: MetabaseModelTypeEnum,
    public model: ApiDashboardDto | ApiCardDto,
    public collections: ApiCollectionDto[]
  ) {}
}
