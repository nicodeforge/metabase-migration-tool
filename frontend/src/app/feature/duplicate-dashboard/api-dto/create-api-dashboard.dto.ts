import { ApiDashboardDto } from './api-dashboard.dto';
import { ApiCollectionDto } from './api-collection.dto';

export class CreateApiDashboardDto {
  constructor(
    public dashboard: ApiDashboardDto,
    public collections: ApiCollectionDto[]
  ) {}
}
